var utils = require('../public/js/inheritance_lib.js');

var boardGameModule = require('../public/js/config.js');
var Direction       = boardGameModule.getDirection();


function Entity(x, y, width, height, side, clazz) {
    // variable defaults 
    x      = utils.isUndefined(x, 0);
    y      = utils.isUndefined(y, 0);
    width  = utils.isUndefined(width, 1);
    height = utils.isUndefined(height, 1);
    clazz  = utils.isUndefined(clazz, 'unknown');
    side   = utils.isUndefined(side, 1); // white

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

    // promote
    this.set("promote", false);
}

/**
 * Set entity position
 */
Entity.prototype.setPosition = function (x, y) {
    this.set("x", x);
    this.set("y", y);
};

/**
 * Checks if entity contains point
 */
Entity.prototype.contains = function (x, y) {
    return (this.x <= x && x <= this.x + this.width
    && this.y <= y && y <= this.y + this.height);
};

/**
 * Check entity move
 */
Entity.prototype.checkMove = function (entities, path, entitiesChanged) {
    var thisPiece = this;

    var destinationX = thisPiece.x;
    var destinationY = thisPiece.y;
    path.forEach(function (direction, directionIndex) {
        destinationX += Direction.getdx(direction);
        destinationY += Direction.getdy(direction);
    });

    var kingEntity = false;
    entities.forEach(function (entity, enitityIndex) {
        if (thisPiece.side === entity.side && entity.clazz === 'king')
            kingEntity = entity;
    });

    if (!kingEntity)
        return false;

    var isValid = true;
    entities.forEach(function (entity, enitityIndex) {
        if ((entity.side !== thisPiece.side)
            // check if current piece takes opponent entity
            && ((entity.x !== destinationX) || (entity.y !== destinationY))
            // try to find opponent entity that attacks current player king
            // check if new destination of current piece breaks (or opens) attack line to king
            && entity.isAttacking(entities, kingEntity.x, kingEntity.y, thisPiece, destinationX, destinationY))
            isValid = false;
    });

    return isValid;
};

/**
 * If we move pieceToMove to it's new destination [destinationX, destinationY]
 * Check if this entity attacks field [tileX, tileY]
 * Check that other entities does not block attack line
 */
Entity.prototype.isAttacking = function (entities, tileX, tileY, pieceToMove, destinationX, destinationY) {
    return false;
};


/**
 * Check if equal with other entity
 */
Entity.prototype.isEqual = function (entity) {
    return (this.x === entity.x && this.y === entity.y && this.side === entity.side && this.clazz === entity.clazz);
};


/**
 * Entity setter
 */
Entity.prototype.set = function (key, value) {
    this[key] = value;
};

exports.Entity = Entity;
exports.get    = function (x, y, width, height, side, clazz) {
    return new Entity(x, y, width, height, side, clazz);
};
