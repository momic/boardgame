var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

var boardGameModule = require('../public/js/config.js');
var Direction       = boardGameModule.getDirection();


/**
 * Knight class
 */
function Knight(x, y, width, height, side) {
    Knight._super.constructor.call(this, x, y, width, height, side, 'knight');
}

utils.inherits(Knight, entity.Entity);

/**
 * If we move pieceToMove to it's new destination [destinationX, destinationY]
 * Check if this entity attacks field [tileX, tileY]
 * Check that other entities does not block attack line
 */
Knight.prototype.isAttacking = function (entities, tileX, tileY, pieceToMove, destinationX, destinationY) {
    var knightPiece = this;

    var modificators = [-2, 2];
    var attacks      = false;
    modificators.forEach(function (mod) {
        var modX = knightPiece.x + mod;
        var modY = knightPiece.y + mod;

        if (((tileX === modX) && (tileY === (knightPiece.y + 1) || tileY === (knightPiece.y - 1)))
            || ((tileY === modY) && (tileX === (knightPiece.x + 1) || tileX === (knightPiece.x - 1))))
            attacks = true;

    });

    return attacks;
};

/**
 * Check entity move
 */
Knight.prototype.checkMove = function (entities, path) {
    var isValid = Knight._super.checkMove.call(this, entities, path);
    if (!isValid)
        return false;

    // knight always moves four fields
    if (path.length !== 2)
        return false;

    // valid directions
    if ((path[1] !== Direction.UP)
        && (path[1] !== Direction.DOWN)
        && (path[1] !== Direction.LEFT)
        && (path[1] !== Direction.RIGHT))
        return false;

    if (path[1] === Direction.UP) {
        if ((path[0] !== Direction.UPRIGHT) && (path[0] !== Direction.UPLEFT))
            return false;
    }
    else if (path[1] === Direction.DOWN) {
        if ((path[0] !== Direction.DOWNRIGHT) && (path[0] !== Direction.DOWNLEFT))
            return false;
    }
    else if (path[1] === Direction.LEFT) {
        if ((path[0] !== Direction.UPLEFT) && (path[0] !== Direction.DOWNLEFT))
            return false;
    }
    else if (path[1] === Direction.RIGHT) {
        if ((path[0] !== Direction.UPRIGHT) && (path[0] !== Direction.DOWNRIGHT))
            return false;
    }

    // allow last step to be opponent piece
    isValid         = true;
    var knightPiece = this;
    var boardX      = knightPiece.x;
    var boardY      = knightPiece.y;
    path.forEach(function (direction, directionIndex) {
        boardX += Direction.getdx(direction);
        boardY += Direction.getdy(direction);
        if (directionIndex === (path.length - 1))
            entities.forEach(function (entity, index) {
                if ((entity.x === boardX)
                    && (entity.y === boardY)
                    && (entity.side === knightPiece.side))
                    isValid = false;
            });
    });

    return isValid;
};

exports.Knight = Knight;
exports.get    = function (x, y, width, height, side) {
    return new Knight(x, y, width, height, side);
};
