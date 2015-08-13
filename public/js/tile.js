/**
 * Tile class
 *
 */
function Tile(entity, gameboard, sprite) {
	destinationY = entity.y * (gameboard.tileHeight + gameboard.tileGap) + gameboard.tileGap;
	destinationX = entity.x * (gameboard.tileWidth  + gameboard.tileGap) + gameboard.tileGap;	

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


