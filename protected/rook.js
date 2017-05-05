var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

var boardGameModule = require('../public/js/config.js');
var Direction       = boardGameModule.getDirection();

/**
 * Rook class
 */
function Rook(x, y, width, height, side) {
    Rook._super.constructor.call(this, x, y, width, height, side, 'rook');
}

utils.inherits(Rook, entity.Entity);

/**
 * If we move pieceToMove to it's new destination [destinationX, destinationY]
 * Check if this entity attacks field [tileX, tileY]
 * Check that other entities does not block attack line
 */
Rook.prototype.isAttacking = function (entities, tileX, tileY, pieceToMove, destinationX, destinationY) {
    var diffX = Math.abs(this.x - tileX);
    var diffY = Math.abs(this.y - tileY);

    if ((diffX === 0 && diffY === 0) || (diffX > 0 && diffY > 0))
        return false;

    var minX = Math.min(this.x, tileX);
    var minY = Math.min(this.y, tileY);

    var i         = this.x;
    var j         = this.y;
    var incrX     = (diffX === 0) ? 0 : ((minX === this.x) ? 1 : -1);
    var incrY     = (diffY === 0) ? 0 : ((minY === this.y) ? 1 : -1);
    var condition = (diffX === 0) ? Math.abs(j - tileY) : Math.abs(i - tileX);

    var tilesToCheck = [];
    var attacks      = true;
    while (condition > 1) {
        i += incrX;
        j += incrY;

        tilesToCheck.push([i, j]);
        if ((destinationX === i) && (destinationY === j))
            attacks = false;

        condition = (diffX === 0) ? Math.abs(j - tileY) : Math.abs(i - tileX);
    }

    if (!attacks)
        return false;

    entities.forEach(function (entity, entityIndex) {
        var x = (entity.isEqual(pieceToMove)) ? destinationX : entity.x;
        var y = (entity.isEqual(pieceToMove)) ? destinationY : entity.y;

        tilesToCheck.forEach(function (tile, tileIndex) {
            if ((tile[0] === x) && (tile[1] === y))
                attacks = false;
        });
    });

    return attacks;
};

/**
 * Check entity move
 */
Rook.prototype.checkMove = function (entities, path) {
    var isValid = Rook._super.checkMove.call(this, entities, path);
    if (!isValid)
        return false;

    // rook can't move more than seven fields
    if (path.length > 7)
        return false;

    // valid directions
    isValid = true;
    path.forEach(function (direction, index) {
        if (((Direction.getdy(direction) < 0) && (direction !== Direction.UP))
            || ((Direction.getdy(direction) > 0) && (direction !== Direction.DOWN))
            || ((Direction.getdx(direction) < 0) && (direction !== Direction.LEFT))
            || ((Direction.getdx(direction) > 0) && (direction !== Direction.RIGHT)))

            isValid = false
    });

    if (!isValid)
        return false;

    // check for piece blocking multi step move
    // allow last step to be opponent piece
    isValid   = true;
    var rookPiece = this;
    var boardX    = rookPiece.x;
    var boardY    = rookPiece.y;
    path.forEach(function (direction, directionIndex) {
        boardX += Direction.getdx(direction);
        boardY += Direction.getdy(direction);
        entities.forEach(function (entity, index) {
            if ((entity.x === boardX)
                && (entity.y === boardY)
                && ((directionIndex < (path.length - 1)) || (entity.side === rookPiece.side)))
                isValid = false;
        });
    });

    return isValid;
};

exports.Rook = Rook;
exports.get  = function (x, y, width, height, side) {
    return new Rook(x, y, width, height, side);
};
