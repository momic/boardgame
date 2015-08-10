/**
 * Tile class
 *
 */
function Tile(boardX, boardY, tileWidth, tileHeight, tileGap, sprite, side) {
	destinationY = boardY * (tileHeight + tileGap) + tileGap;
	destinationX = boardX * (tileWidth  + tileGap) + tileGap;	

	Tile._super.constructor.call(this, destinationX, destinationY);

	this.set("width", tileWidth);
	this.set("height", tileHeight);
	this.set("gap", tileGap);

	this.set("fillStyle", "#FFF673");
	this.set("sprite", sprite);
	this.setDrawingContext();

	this.set("selected", false);
	this.set("side", side); // 0 = black, 1 = white
}

inherits(Tile, ActiveEntity);


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


