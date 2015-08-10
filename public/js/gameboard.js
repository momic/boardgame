
/**
 * Gameboard class
 */
function Gameboard(x, y) {
	Gameboard._super.constructor.call(this, x, y);

	this.initialize();
}

inherits(Gameboard, Entity);

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

	// update gameboard fill and properties
	this.setDrawingContext();

	// create status box
	this.statusBox = new StatusBox('');
	this.statusBox.set("y", Math.round(this.height / 2));

	// create default styled tiles
	this.createTiles();

	// side to move
	this.sideToMove = 1;

	// player side
	this.side = -1;
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
Gameboard.prototype.createTiles = function () {
    this.tiles = [];

    for(j=0; j<2; j++) {
		// pawns
		for(i=0; i<8; i++)
			this.tiles.push(new Tile(i, (j == 0) ? 1 : 6, this.tileWidth, this.tileHeight, this.tileGap, ['chessPiecesSprite', 11 - j * 6], j));

	    // rook
		this.tiles.push(new Tile(0, j * 7, this.tileWidth, this.tileHeight, this.tileGap, ['chessPiecesSprite', 10 - j * 6, 0, 0], j));
		this.tiles.push(new Tile(7, j * 7, this.tileWidth, this.tileHeight, this.tileGap, ['chessPiecesSprite', 10 - j * 6, 0, 0], j));

		// bishop
		this.tiles.push(new Tile(2, j * 7, this.tileWidth, this.tileHeight, this.tileGap, ['chessPiecesSprite', 8 - j * 6], j));
		this.tiles.push(new Tile(5, j * 7, this.tileWidth, this.tileHeight, this.tileGap, ['chessPiecesSprite', 8 - j * 6], j));

		// queen and king
		this.tiles.push(new Tile(3, j * 7, this.tileWidth, this.tileHeight, this.tileGap, ['chessPiecesSprite', 7 - j * 6], j));
		this.tiles.push(new Tile(4, j * 7, this.tileWidth, this.tileHeight, this.tileGap, ['chessPiecesSprite', 6 - j * 6], j));

		// knight
		this.tiles.push(new Tile(1, j * 7, this.tileWidth, this.tileHeight, this.tileGap, ['chessPiecesSprite', 9 - j * 6], j));
		this.tiles.push(new Tile(6, j * 7, this.tileWidth, this.tileHeight, this.tileGap, ['chessPiecesSprite', 9 - j * 6], j));		
    }
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
