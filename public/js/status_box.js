/**
 * StatusBox class
 */
function StatusBox(text) {
    StatusBox._super.constructor.call(this);
	 this.initialize();
    this.setText(text);

}

inherits(StatusBox, Entity);

/**
 * Set status box state
 */
StatusBox.prototype.initialize = function() {
    this.set("font", "18pt Arial");
    gameScreen.context.font = this.font;
    this.set("fillStyle", "#fff");
	this.setDrawingContext();
}

/**
 * Draw status box entity
 *
 */
StatusBox.prototype.draw = function () {
	gameScreen.context.font = this.font;
	gameScreen.context.fillStyle = this.fillStyle;
	gameScreen.context.fillText(this.text, this.x, this.y);
}

/**
 * Set text of status box
 */
StatusBox.prototype.setText = function(text) {
	this.set("text", text);
	this.set("width", gameScreen.context.measureText(this.text).width);
}
