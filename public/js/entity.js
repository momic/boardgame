/**
 * Entity class
 */
function Entity(x, y, width, height)
{
    // variable defaults 
    x = isUndefined(x, 0);
    y = isUndefined(y, 0);
    width = isUndefined(width, this.ENTITY_WIDTH);
    height = isUndefined(height, this.ENTITY_HEIGHT);
    
    // position of entity
    this.setPosition(x, y);
    
    // size of entity
    this.set("width", width);
    this.set("height", height);

    // set drawing context
    this.setDrawingContext();
}

/**
 * Tile size in pixels
 * default entity size
 */
Entity.prototype.ENTITY_WIDTH = 48;
Entity.prototype.ENTITY_HEIGHT = 48;

/**
 * Create pre-render off-screen canvas for later drawing
 * 
 * Needs to be called after entity changes its visual representation 
 * (width, height, sprite, fillStyle, strokeStyle, strokeWidth)
 */
Entity.prototype.setDrawingContext = function () {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.drawingContext = this.canvas.getContext('2d');
    
    if (this.sprite) {
        // sprite image
        var spriteRepo = this.sprite[0];
        var args = this.sprite.slice(1);
        args.unshift(this.drawingContext);

        var spriteRepoInstance = gameScreen.spriteRepository[spriteRepo];
        spriteRepoInstance.draw.apply(spriteRepoInstance, args);
    } else {
        // fill style
        this.setContextFill();
    }
}

/**
 * Set entity fill
 */
Entity.prototype.setContextFill = function () {
    this.fillStyle = isUndefined(this.fillStyle, "#FFF673");
    this.drawingContext.fillStyle=this.fillStyle;
    this.drawingContext.fillRect(0, 0, this.width, this.height);
    
    this.strokeStyle = isUndefined(this.strokeStyle, "#bbb");
    this.strokeWidth = isUndefined(this.strokeWidth, 1);
    this.drawingContext.strokeStyle = this.strokeStyle;
    this.drawingContext.lineWidth   = this.strokeWidth;
    this.drawingContext.strokeRect(0, 0, this.width, this.height);
}

/**
 * Draw entity
 */
Entity.prototype.draw = function () {
    gameScreen.context.drawImage(this.canvas, this.x, this.y);
}

/**
 * Set entity position
 */
Entity.prototype.setPosition = function (x, y) {
    this.set("x", x);
    this.set("y", y);    
}

/**
 * Checks if entity contains point
 */
Entity.prototype.contains = function (x, y) {
    if (this.x <= x && x <= this.x + this.width && 
        this.y <= y && y <= this.y + this.height) {
        return true;
    }
    return false;    
}

/**
 * Entity setter
 */
Entity.prototype.set = function (key, value) { 
    this[key] = value; 
}