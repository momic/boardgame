
/**
 * Gameboard class
 */
function Gameboard(x, y) {
	Gameboard._super.constructor.call(this, x, y);

	this.initialize();
}

utils.inherits(Gameboard, Entity);

/**
 * Create tile enitities
 */
Gameboard.prototype.initialize = function() {
	// tiles per width/height
	this.boardWidth = boardGameModule.Config.COLUMNS;
	this.boardHeight = boardGameModule.Config.ROWS;

	// tile size
	this.tileWidth = boardGameModule.Config.TILE_WIDTH;
	this.tileHeight = boardGameModule.Config.TILE_HEIGHT;
	this.tileGap = boardGameModule.Config.TILE_GAP;

	// size of gameboard
	this.width = boardGameModule.Config.WIDTH;
	this.height = boardGameModule.Config.HEIGHT;

	// gameboard active
	this.active = false;

	// flipped
	this.flipped = false;

	// update gameboard fill and properties
	this.setDrawingContext();

	// create status box
	this.statusBox = new StatusBox('');
	this.statusBox.set("y", Math.round(this.height / 2));

	// default empty tiles
	this.tiles = [];

	// side to move
	this.sideToMove = 1;

	// player side
	this.playerSide = false;
}

/**
 * Set entity fill
 */
Gameboard.prototype.setContextFill = function() {
	// Call super method
	Gameboard._super.setContextFill.call(this);

	// draw checkboard
	for (i = 0; i < this.boardWidth; i++) {
		for (j = 0; j < this.boardHeight; j++) {

	    	destinationY = j * (this.tileHeight + this.tileGap) + this.tileGap;
	    	destinationX = i * (this.tileWidth  + this.tileGap) + this.tileGap;

	        this.drawingContext.fillStyle = ((j % 2) == (i % 2)) ? "#aaa" : "#777";
	        this.drawingContext.fillRect(destinationX, destinationY, this.tileWidth, this.tileHeight);
		}
	}
}


/**
 * Create tile entities
 */
Gameboard.prototype.createTiles = function (entities) {
    this.tiles = [];
    var gameboard = this;

	entities.forEach(function(entity, index) {
		var sprite;
		switch(entity.clazz) {
			case 'pawn':
				sprite = (entity.side == 1) ? 5 : 11;
			break;			
			case 'rook':
				sprite = (entity.side == 1) ? 4 : 10;
			break;			
			case 'bishop':
				sprite = (entity.side == 1) ? 2 : 8;
			break;			
			case 'queen':
				sprite = (entity.side == 1) ? 1 : 7;
			break;			
			case 'king':
				sprite = (entity.side == 1) ? 0 : 6;
			break;			
			case 'knight':
				sprite = (entity.side == 1) ? 3 : 9;
			break;			
		}

		gameboard.tiles.push(new Tile(entity, gameboard, ['chessPiecesSprite', sprite]));
	});
};

/**
 * Draw tiles
 */
Gameboard.prototype.drawTiles = function() {
	this.tiles.forEach(function(tile, tileIndex) {
		tile.draw();
		tile.applyMovement();
	});
}

/**
 * Draw gameboard entity
 */
Gameboard.prototype.draw = function() {
	// call to super method draw from overrided
	Gameboard._super.draw.call(this);

	// draw tiles
	this.drawTiles();

	// draw status box
	this.statusBox.draw();
}
