/**
 * Button class
 */
function Button(text, x, y, onClick, color) {
    Button._super.constructor.call(this, x, y);

    this.set("text", text);
    this.set("fillStyle", color);
    this.set("width", 96);
    this.set("height", 32);
    this.set("fontStyle", "12pt Arial");
    this.setDrawingContext();

    this.onClick = onClick;
}

utils.inherits(Button, Entity);

/**
 * Draw button entity
 */
Button.prototype.draw = function () {
    Button._super.draw.call(this);

    gameScreen.context.font = this.fontStyle;
    gameScreen.context.fillStyle="#fff";
    textWidth = gameScreen.context.measureText(this.text).width;
    gameScreen.context.fillText(this.text, this.x + (this.width - textWidth) / 2, this.y + this.height / 2 + 5);
}

/**
 * Button click
 */
Button.prototype.onClick = function() {
}