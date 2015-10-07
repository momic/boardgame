/**
 * GameScreen class
 */
function GameScreen()
{
	// Sprites
	this.spriteRepository = new SpriteRepository();

	// Canvas
	this.initCanvasElement();

	// Screens
	this.screenRepository = new ScreenRepository();

	// Active screen
	this.activeScreen = this.screenRepository.mainMenuScreen();

	// Player
	this.player = new playerModule.Player();
}

/**
 * Canvas initialization
 */
GameScreen.prototype.initCanvasElement = function()
{
	this.canvas = $("#canvas")[0];
	this.setCanvasSize();

	this.context = this.canvas.getContext('2d');
	
	this.canvas.addEventListener("touchstart", this.onMouseDown);
	this.canvas.addEventListener("mousedown", this.onMouseDown);
	this.canvas.addEventListener("mousemove", this.onMouseMove);
}

/**
 * Get mouse pos relative to canvas pos
 */
GameScreen.prototype.getRelativeMousePos = function(evt)
{
	canoffset = $(this.canvas).offset();
	posX = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
	posY = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

	return {
		x: posX,
		y: posY
	};
}

/**
 * onMouseMove event for hover tooltips and cursor changes
 */
GameScreen.prototype.onMouseMove = function(evt)
{
}

/**
 * onMouseDown event for mouse/touch interaction
 */
GameScreen.prototype.onMouseDown = function(evt)
{
	evt.stopPropagation();
	// evt.preventDefault();

	var mousePos = gameScreen.getRelativeMousePos(evt);

	var candidateControls = new Array();
	var candidateEntities = new Array();

	for (entityID in gameScreen.activeScreen.entities) {
		var entity = gameScreen.activeScreen.entities[entityID];
		if (entity.contains(mousePos.x, mousePos.y)) {
			if (entity instanceof Gameboard) {
				candidateEntities.push(entityID);
			} else {
				candidateControls.push(entityID);
			}
		}
	}

	if (candidateControls.length) {
		candidateControls.forEach(function(entityID) {
			var entity = gameScreen.activeScreen.entities[entityID];
			if (entity instanceof Button) {
				// button is clicked - call onClick handler
				entity.onClick();
				return;
			} else if (entity instanceof Menu) {
				// menu was clicked - call onClick handler of apropriate button
				entity.buttons.forEach(function(button) {
					if (button.contains(mousePos.x, mousePos.y)) {
						button.onClick();
						return;
					}
				});
			}
		});
	} else {
		candidateEntities.forEach(function(entityID) {
			var entity = gameScreen.activeScreen.entities[entityID];
			if (entity instanceof Gameboard && entity.active) {
				var tileClicked = false;
				var tileToMove = false;

				// tile is clicked - open context menu
				entity.tiles.forEach(function(tile, tileIndex) {
					if (tile.contains(mousePos.x, mousePos.y) && (entity.sideToMove == tile.side) 
						&& (entity.sideToMove === gameScreen.player.side)) {
						
						tileClicked = true;
						// stroke that entity
						tile.toggleSelected();
						return;
					} else { 
						if (tile.selected) {
							tile.toggleSelected();
							if (entity.sideToMove == tile.side)
								tileToMove = tile;
						}
					}
				});

				if (!tileClicked && tileToMove !== false) {
					var moveProperties = new Object();
					
					if (entity.flipped) {
						// clone tileToMove and mousePos and flipp coordinates
						var flippedMousePosX = entity.width - mousePos.x;
						var flippedMousePosY = entity.height - mousePos.y;
						var flippedMousePos = new Object();
						flippedMousePos.x = flippedMousePosX;
						flippedMousePos.y = flippedMousePosY;
						
						moveProperties.mousePos = flippedMousePos;
						moveProperties.tileToMove = tileToMove.getFlippedTile(entity);
					}
					else {
						moveProperties.mousePos = mousePos;
						moveProperties.tileToMove = tileToMove;
					}

					socket.emit('move', moveProperties);
				}
			}
		});
	}
}

socket.on('promote', function(msg) {
    var $promoteModal = $('#promoteModal');
    $promoteModal.find('form').submit(function(e) {
      e.preventDefault();
      $promoteModal.modal('hide');
    });

    $promoteModal.modal('toggle')
        .on('hidden.bs.modal', function (e) {
            msg.promoteTo = $('form input[type=radio]:checked').val();
            socket.emit('move', msg);
        });
});

socket.on('turn complete', function(msg) {
	var gameboard = gameScreen.activeScreen.entities['gameboard'];

	// take
	msg.entitiesDeleted.forEach(function(entity, entityIndex) {
    	var destinationY = ((gameboard.flipped) ? (gameboard.boardHeight - 1 - entity.y) : entity.y) * (gameboard.tileHeight + gameboard.tileGap) + gameboard.tileGap;
    	var destinationX = ((gameboard.flipped) ? (gameboard.boardWidth - 1 - entity.x) : entity.x) * (gameboard.tileWidth  + gameboard.tileGap) + gameboard.tileGap;

	  	gameboard.tiles.forEach(function(tile, tileIndex) {
	    	if ((tile.x == destinationX) && (tile.y == destinationY) && (tile.side === entity.side)) {
	      		delete gameboard.tiles[tileIndex];
	    	}
	  	});		
	});

	// add new pieces
	if (msg.entitiesAdded)
		gameboard.createTiles(msg.entitiesAdded);

	// move piece
	msg.entitiesChanged.forEach(function(entity, entityIndex) {
    	var entityY = ((gameboard.flipped) ? (gameboard.boardHeight - 1 - entity.y) : entity.y) * (gameboard.tileHeight + gameboard.tileGap) + gameboard.tileGap;
    	var entityX = ((gameboard.flipped) ? (gameboard.boardWidth - 1 - entity.x) : entity.x) * (gameboard.tileWidth  + gameboard.tileGap) + gameboard.tileGap;

		gameboard.tiles.forEach(function(tile, tileIndex) {
			if ((tile.x === entityX) && (tile.y === entityY) && (entity.path.length > 0)) {
				tile.setPath((gameboard.flipped) ? tile.getFlippedPath(entity) : entity.path);
			}
		});
	});

	// switch sides after move
	gameboard.set("sideToMove", (gameboard.sideToMove == 1) ? 0 : 1);
});

socket.on('start_game', function(data) {
	console.log("STARTING GAME...");
	$('#left-header-text').text('White: ' + data.whitePlayer.nick);
	$('#right-header-text').text('Black: ' + data.blackPlayer.nick);

	var gameboard = gameScreen.activeScreen.entities['gameboard'];

	// create gameboard tiles
	gameboard.createTiles(data.entities);

	gameboard.statusBox.setText("");
	gameboard.set("active", true);
});

socket.on('side', function(player) {
	gameScreen.player.set("side", player.side);

	var gameboard = gameScreen.activeScreen.entities['gameboard'];
	gameboard.set("flipped", (player.side == 0));
});

/**
 * Set canvas size
 */
GameScreen.prototype.setCanvasSize = function() {
	this.canvas.setAttribute("width", boardGameModule.Config.WIDTH);
	this.canvas.setAttribute("height", boardGameModule.Config.HEIGHT);
}

/**
 * Enter full screen
 */
GameScreen.prototype.enterFullScreen = function() {
    if(this.canvas.webkitRequestFullScreen)
    	this.canvas.webkitRequestFullScreen();
    else
    	this.canvas.mozRequestFullScreen();
}
 
/**
 * Draw game screen
 */
GameScreen.prototype.draw = function() {
	this.activeScreen.draw();
}

/**
 * onFrameDraw event
 */
GameScreen.prototype.onFrameDraw = function()
{
}

/**
 * onKeyDown event
 */
GameScreen.prototype.onKeyDown = function(key)
{
}

/**
 * Add entity to active screen
 */
GameScreen.prototype.addEntity = function(entityID, entity)
{
	this.activeScreen.addEntity(entityID, entity);
}

/**
 * Remove entity from active screen
 */
GameScreen.prototype.removeEntity = function(entityID)
{
	this.activeScreen.removeEntity(entityID);
}

/**
 * Get entity from active screen by entityID
 */
GameScreen.prototype.getEntityByID = function(entityID)
{
	return this.activeScreen.getEntityByID(entityID);
}

/**
 * Checks if active screen has screenID
 */
GameScreen.prototype.activeScreenIs = function(entityID)
{
	return this.activeScreen.is(entityID);
}

/**
 * Sets active screen
 */
GameScreen.prototype.setActiveScreen = function(activeScreen)
{
	this.activeScreen = activeScreen;
	this.clearActiveScreen();
}

/**
 * Clears active screen
 */
GameScreen.prototype.clearActiveScreen = function()
{
	this.context.clearRect(0, 0, this.canvas.getAttribute("width"), this.canvas.getAttribute("height"));
}