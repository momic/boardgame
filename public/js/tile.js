/**
 * Tile class
 *
 */
function Tile(entity, gameboard, sprite) {
	destinationY = ((gameboard.flipped) ? (gameboard.boardHeight - 1 - entity.y) : entity.y) * (gameboard.tileHeight + gameboard.tileGap) + gameboard.tileGap;
	destinationX = ((gameboard.flipped) ? (gameboard.boardWidth - 1 - entity.x) : entity.x) * (gameboard.tileWidth  + gameboard.tileGap) + gameboard.tileGap;

	Tile._super.constructor.call(this, destinationX, destinationY);

	this.set("width", entity.width * gameboard.tileWidth);
	this.set("height", entity.height * gameboard.tileHeight);
	this.set("gap", gameboard.tileGap);

	this.set("fillStyle", "#FFF673");
	this.set("sprite", sprite);
	this.setDrawingContext();

	this.set("selected", false);
	this.set("side", entity.side); // 0 = black, 1 = white
	this.set("clazz", entity.clazz); // knight, bishop, queen, king, rook, pawn
}

utils.inherits(Tile, ActiveEntity);


/**
 * Draw tile entity
 */
Tile.prototype.draw = function() {
	// call to super method draw from overrided
	// calling super class (entity) method with current context (tile)
	Tile._super.draw.call(this);

}

Tile.prototype.toggleSelected = function() {
	this.set("selected", !this.selected);
	if (this.selected) {
	    this.drawingContext.strokeStyle = "#f00";
	    this.drawingContext.lineWidth   = 2;
	    this.drawingContext.strokeRect(0, 0, this.width, this.height);

    	this.drawingContext.fillStyle = "rgba(220, 50, 50, 0.3)";
    	this.drawingContext.fillRect(0, 0, this.width, this.height);
    }
    else
    	this.setDrawingContext();
}

Tile.prototype.getFlippedTile = function(gameboard) {
	// copy object (only properties)
	var flippedTile = JSON.parse(JSON.stringify(this));

	// calc flipped position
    flippedY = gameboard.boardHeight * (this.height + this.gap) - this.height - this.y + this.gap;
    flippedX = gameboard.boardWidth * (this.width  + this.gap) - this.width - this.x + this.gap;
    
    // set flipped position
    flippedTile.x = flippedX;
    flippedTile.y = flippedY;

    return flippedTile;
}

Tile.prototype.getFlippedPath = function(entity) {
	var flippedPath = [];
	entity.path.forEach(function(direction, directionIndex) {
		switch (direction[0]) {
			case (boardGameModule.Direction.UP[0]):
				flippedPath.push(boardGameModule.Direction.DOWN);
			break;
			case (boardGameModule.Direction.DOWN[0]):
				flippedPath.push(boardGameModule.Direction.UP);
			break;
			case (boardGameModule.Direction.RIGHT[0]):
				flippedPath.push(boardGameModule.Direction.LEFT);
			break;
			case (boardGameModule.Direction.LEFT[0]):
				flippedPath.push(boardGameModule.Direction.RIGHT);
			break;
			case (boardGameModule.Direction.UPLEFT[0]):
				flippedPath.push(boardGameModule.Direction.DOWNRIGHT);
			break;
			case (boardGameModule.Direction.UPRIGHT[0]):
				flippedPath.push(boardGameModule.Direction.DOWNLEFT);
			break;
			case (boardGameModule.Direction.DOWNLEFT[0]):
				flippedPath.push(boardGameModule.Direction.UPRIGHT);
			break;
			case (boardGameModule.Direction.DOWNRIGHT[0]):
				flippedPath.push(boardGameModule.Direction.UPLEFT);
			break;
		}
	});	

	return flippedPath;
}


