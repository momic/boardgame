/**
 * Menu class
 *
 * Vertical ordered list of buttons
 */
function Menu(x, y, buttons) {
    Menu._super.constructor.call(this, x, y);
    this.set("constructorName", "Menu");
    this.buttons = buttons;

    var offset   = 0;
    var maxWidth = 0;
    this.buttons.forEach(function (button) {
        button.setPosition(x, y + offset);
        offset += button.height + 1;
        if (button.width > maxWidth) {
            maxWidth = button.width;
        }
    });

    this.width  = maxWidth;
    this.height = offset;
    this.setDrawingContext();
}

utils.inherits(Menu, Entity);

/**
 * Draw menu entity
 */
Menu.prototype.draw = function () {
    Menu._super.draw.call(this);
    this.buttons.forEach(function (button) {
        button.draw();
    });
};
