var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

var boardGameModule = require('../public/js/config.js');
var Direction       = boardGameModule.getDirection();

/**
 * King class
 */
function King(x, y, width, height, side) {
    King._super.constructor.call(this, x, y, width, height, side, 'king');

    this.set("moved", false);
}

utils.inherits(King, entity.Entity);

/**
 * Check entity move
 */
King.prototype.checkMove = function (entities, path, entitiesChanged) {
    var kingPiece = this;
    var isValid   = true;
    var boardX    = kingPiece.x;

    // king can't move more than one field
    if (path.length > 2) {
        return false;
    }
    else if (path.length > 1) {
        // check king move
        if ((kingPiece.moved)
            || (path[0] !== path[1])
            || ((path[1] !== Direction.LEFT) && (path[1] !== Direction.RIGHT)))
            return false;

        var rightRochade  = (path[1] === Direction.RIGHT);
        var rookPositionX = (rightRochade) ? (boardGameModule.Config.ROWS - 1) : 0;

        // try to find proper rook
        var rook = false;
        entities.forEach(function (entity, entityIndex) {
            if ((entity.clazz === "rook")
                && (entity.side === kingPiece.side)
                && (entity.y === kingPiece.y)
                && (entity.x === rookPositionX))
                rook = entity;
        });

        if (rook === false)
            return false;

        // check that king is not under attack by opponent entities
        isValid          = true;
        boardX           = kingPiece.x;
        var destinationX = kingPiece.x + Direction.getdx(path[0]) * 2;

        entities.forEach(function (entity, index) {
            if ((entity.side !== kingPiece.side)
                && (entity.isAttacking(entities, kingPiece.x, kingPiece.y, kingPiece, destinationX, kingPiece.y)))
                isValid = false;
        });

        if (!isValid)
            return false;

        // calculate rook path
        var rookPath      = [];
        var rookDirection = (rightRochade) ? Direction.LEFT : Direction.RIGHT;
        var rookMoveCount = (rightRochade) ? 2 : 3;
        for (var i = 0; i < rookMoveCount; i++)
            rookPath.push(rookDirection);

        // check that fields are not under attack by opponent entities
        // check from rook side because of possibility of 3 moves
        isValid      = true;
        boardX       = rook.x;
        destinationX = rook.x + Direction.getdx(rookDirection) * rookMoveCount;
        rookPath.forEach(function (direction, directionIndex) {
            boardX += Direction.getdx(direction);
            entities.forEach(function (entity, index) {
                if ((entity.side !== kingPiece.side) &&
                    (entity.isAttacking(entities, boardX, kingPiece.y, kingPiece, destinationX, kingPiece.y))) {
                    isValid = false;
                }
            });
        });

        if (!isValid)
            return false;

        // set rook path
        rook.set("path", rookPath);
        entitiesChanged.push(rook);
    }
    else {
        // allow last step to be opponent piece
        isValid    = true;
        boardX     = kingPiece.x;
        var boardY = kingPiece.y;
        path.forEach(function (direction, directionIndex) {
            boardX += Direction.getdx(direction);
            boardY += Direction.getdy(direction);
            entities.forEach(function (entity, index) {
                // check that player side piece is blocking multi step move
                if ((entity.x === boardX) && (entity.y === boardY) && (entity.side === kingPiece.side))
                    isValid = false;
                // check that destination is not under attack by opponent entities
                if ((entity.side !== kingPiece.side) &&
                    (entity.isAttacking(entities, boardX, boardY, kingPiece, boardX, boardY))) {
                    isValid = false;
                }

                // var test = entity.isAttacking(entities, boardX, boardY, kingPiece, boardX, boardY);
                // if (test) {
                // 	console.log("--Entity attacking kings destination-----------------------");
                // 	console.log(entity.clazz);
                // 	console.log(entity.x);
                // 	console.log(entity.y);
                // 	console.log((entity.side == 0) ? 'black' : 'white');
                // }
            });
        });

        if (!isValid)
            return false;
    }

    kingPiece.set("moved", true);
    return true;
};

/**
 * If we move pieceToMove to it's new destination [destinationX, destinationY]
 * Check if this entity attacks field [tileX, tileY]
 * Check that other entities does not block attack line
 */
King.prototype.isAttacking = function (entities, tileX, tileY, pieceToMove, destinationX, destinationY) {
    var diffX = Math.abs(this.x - tileX);
    var diffY = Math.abs(this.y - tileY);

    if (diffX > 1 || diffY > 1)
        return false;

    return (diffX === 1 || diffY === 1);
};


exports.King = King;
exports.get  = function (x, y, width, height, side) {
    return new King(x, y, width, height, side);
};
