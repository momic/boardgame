var utils = require('../public/js/inheritance_lib.js');

function Entity(x, y, width, height, side, clazz)
{
    // variable defaults 
    x = utils.isUndefined(x, 0);
    y = utils.isUndefined(y, 0);
    width = utils.isUndefined(width, 1);
    height = utils.isUndefined(height, 1);
    clazz = utils.isUndefined(clazz, 'unknown');
    side = utils.isUndefined(side, 1); // white
    
    // position of entity
    this.setPosition(x, y);
    
    // size of entity
    this.set("width", width);
    this.set("height", height);

    // class
    this.clazz = clazz;

    // side
    this.side = side;

    // path
    this.path = [];
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
 * Check entity move
 */
Entity.prototype.checkMove = function (entities, path) {
    return true;
}

/**
 * Entity setter
 */
Entity.prototype.set = function (key, value) { 
    this[key] = value; 
}

exports.Entity = Entity;
exports.get = function(x, y, width, height, side, clazz)
{
    return new Entity(x, y, width, height, side, clazz);
}