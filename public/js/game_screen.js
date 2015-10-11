/**
 * GameScreen class
 */
function GameScreen()
{
	// Chrome extension
	this.isChromeExtension = ((typeof window.chrome != 'undefined') && 
							  (typeof chrome.extension != 'undefined'));

	// Root element
	this.initDocumentRoot();

	// Socket
	if (this.isChromeExtension)
		this.initExtensionListener();
	else
		this.initSocketIO();

	// Dropup
	this.initDropupElements();

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

	// Nick name
	this.loadNickName();
}

/**
 * Document root initialization
 */
GameScreen.prototype.initDocumentRoot = function()
{
	this.documentRoot = $(window.document.documentElement);
}

/**
 * Load nick name
 */
GameScreen.prototype.loadNickName = function()
{
    var nickName = localStorage.getItem('nickName');
    var $documentRoot = this.documentRoot;
    if (localStorage.getItem('nickName')) {
        $documentRoot.find('#left-header-text').text('Hello ' + nickName);
        this.player.set("nick", nickName);
    } else {
        // player name modal
        var $nickModal = $documentRoot.find('#playerNameModal');
        $nickModal.find('form').submit(function(e) {
          e.preventDefault();
          $nickModal.modal('hide');
        });

        $nickModal.modal('toggle')
            .on('shown.bs.modal', function(e) {
                $nickModal.find('#nick-name').focus();
            })
            .on('hidden.bs.modal', function (e) {
                var nickName = $nickModal.find('#nick-name').val().trim();
                // If entered put the object into storage
                if (nickName)
                    localStorage.setItem('nickName', nickName);

                nickName = (nickName) ? nickName : 'guest';
                $documentRoot.find('#left-header-text').text('Hello ' + nickName);
                gameScreen.player.set("nick", nickName);
            });        
    }
}

/**
 * Init dropup elements
 */
GameScreen.prototype.initDropupElements = function()
{
	$("#new-game-button").mousedown(function() {
		gameScreen.setActiveScreen(gameScreen.screenRepository.gameBoardScreen());
	});
}

/**
 * Canvas initialization
 */
GameScreen.prototype.initCanvasElement = function()
{
	var $documentRoot = this.documentRoot;
	this.canvas = $documentRoot.find("#canvas")[0];
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

					gameScreen.emit('move', moveProperties);
				}
			}
		});
	}
}

/**
 * Promote figure
 */
GameScreen.prototype.emit = function(action, data)
{
    if (gameScreen.isChromeExtension)
    	chrome.runtime.sendMessage({action:action, data:data},function(response){});
    else
		gameScreen.socket.emit(action, data);
}
/**
 * Promote figure
 */
GameScreen.prototype.promoteFigure = function($documentRoot, msg)
{
    var $promoteModal = $documentRoot.find('#promoteModal');
    $promoteModal.find('form').submit(function(e) {
      e.preventDefault();
      $promoteModal.modal('hide');
    });

    $promoteModal.modal('toggle')
        .on('hidden.bs.modal', function (e) {
            msg.promoteTo = $promoteModal.find('form input[type=radio]:checked').val();
            gameScreen.emit('move', msg);
        });
}

/**
 * End Turn
 */
GameScreen.prototype.endTurn = function(msg)
{
	var gameboard = gameScreen.activeScreen.entities['gameboard'];

	// take
	if (msg.entitiesDeleted)
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
	if (msg.entitiesChanged)
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
}

/**
 * Start game
 */
GameScreen.prototype.startGame = function($documentRoot, data)
{
	console.log("STARTING GAME...");
	$documentRoot.find('#left-header-text').text('White: ' + data.whitePlayer.nick);
	$documentRoot.find('#right-header-text').text('Black: ' + data.blackPlayer.nick);

	var gameboard = gameScreen.activeScreen.entities['gameboard'];

	// create gameboard tiles
	gameboard.createTiles(data.entities);

	gameboard.statusBox.setText("");
	gameboard.set("active", true);	
}

/**
 * Set player's side
 */
GameScreen.prototype.setSide = function(player)
{
	gameScreen.player.set("side", player.side);

	var gameboard = gameScreen.activeScreen.entities['gameboard'];
	gameboard.set("flipped", (player.side == 0));
}

/**
 * Extension messaging initialization
 */
GameScreen.prototype.initExtensionListener = function()
{
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	    console.log(sender.tab ?
	                "from a content script:" + sender.tab.url :
	                "from the extension");
	    switch (request.action) {
	    	case 'promote':
	    		gameScreen.promoteFigure(gameScreen.documentRoot, request.data);
	    		break;
	    	case 'turn complete':
	    		gameScreen.endTurn(request.data);
	    		break;
	    	case 'start_game':
	    		gameScreen.startGame(gameScreen.documentRoot, request.data);
	    		break;
	    	case 'side':
	    		gameScreen.setSide(request.data);
	    		break;
	    }
	  });
}

/**
 * SocketIO initialization
 */
GameScreen.prototype.initSocketIO = function()
{
	this.socket = io.connect(boardGameModule.Config.HOST);

	this.socket.on('promote', function(msg) {
		gameScreen.promoteFigure(gameScreen.documentRoot, msg);
	});

	this.socket.on('turn complete', function(msg) {
		gameScreen.endTurn(msg);
	});

	this.socket.on('start_game', function(data) {
		gameScreen.startGame(gameScreen.documentRoot, data);
	});

	this.socket.on('side', function(player) {
		gameScreen.setSide(player)
	});
}


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