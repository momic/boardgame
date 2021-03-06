var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

var boardGameModule = require('../public/js/config.js');
var Direction       = boardGameModule.getDirection();

/**
 * Pawn class
 */
function Pawn(x, y, width, height, side) {
    Pawn._super.constructor.call(this, x, y, width, height, side, 'pawn');

    // en passan
    this.set("enpassan", false);
    this.set("enpassaned", false);
}

utils.inherits(Pawn, entity.Entity);

/**
 * If we move pieceToMove to it's new destination [destinationX, destinationY]
 * Check if this entity attacks field [tileX, tileY]
 * Check that other entities does not block attack line
 */
Pawn.prototype.isAttacking = function (entities, tileX, tileY, pieceToMove, destinationX, destinationY) {
    var pawnPiece = this;
    var direction = (pawnPiece.side === 1) ? Direction.UP : Direction.DOWN;
    var modY      = Direction.getdy(direction);
    return ((tileX === (pawnPiece.x + 1) || (tileX === (pawnPiece.x - 1))) && (tileY === (pawnPiece.y + modY)));
};

/**
 * Check entity move
 */
Pawn.prototype.checkMove = function (entities, path, entitiesChanged) {
    var isValid = Pawn._super.checkMove.call(this, entities, path);
    if (!isValid)
        return false;

    var pawnPiece = this;

    // pawn can't move more than two fields
    if (path.length > 2)
        return false;

    // valid directions
    isValid = false;
    path.forEach(function (direction, index) {
        if ((
                (pawnPiece.side === 1)
                && (Direction.getdy(direction) < 0)
                && ((direction === Direction.UP) || (direction === Direction.UPRIGHT) || (direction === Direction.UPLEFT))
            ) || (
                (pawnPiece.side === 0)
                && (Direction.getdy(direction) > 0)
                && ((direction === Direction.DOWN) || (direction === Direction.DOWNRIGHT) || (direction === Direction.DOWNLEFT))
            ))

            isValid = true;
    });


    if (!isValid)
        return false;

    if (path.length === 2) {
        // check for initial pawn position
        if (this.side === 1 && this.y !== (boardGameModule.Config.ROWS - 2))
            return false;

        if (this.side === 0 && this.y !== 1)
            return false;

        // check that we are using just UP / DOWN for two step move
        isValid = true;
        path.forEach(function (direction, index) {
            if (direction !== ((pawnPiece.side === 1) ? Direction.UP : Direction.DOWN))
                isValid = false;
        });

        if (!isValid)
            return false;

        // check for piece blocking two step move
        isValid = true;
        entities.forEach(function (entity, index) {
            if ((entity.x === pawnPiece.x)
                && (
                    (entity.y === (pawnPiece.y + Direction.getdy(path[0])))
                    || (entity.y === (pawnPiece.y + Direction.getdy(path[0]) * 2))
                ))
                isValid = false;
        });

        if (!isValid)
            return false;

        // en passan
        entities.forEach(function (entity, index) {
            if ((Math.abs(entity.x - pawnPiece.x) === 1)
                && ((entity.y === (pawnPiece.y + Direction.getdy(path[0]) * 2)))) {

                pawnPiece.enpassan  = true;
                pawnPiece.enpassanX = pawnPiece.x;
                pawnPiece.enpassanY = pawnPiece.y + Direction.getdy(path[0]);
            }
        });
    } else {
        // check for piece blocking one step move
        var direction = path[0];

        if (direction === ((pawnPiece.side === 1) ? Direction.UP : Direction.DOWN)) {
            // one step
            isValid = true;
            entities.forEach(function (entity, index) {
                if ((entity.x === pawnPiece.x) &&
                    (entity.y === (pawnPiece.y + Direction.getdy(direction))))
                    isValid = false;
            });

            if (!isValid)
                return false;
        }
        else {
            // take
            isValid = false;
            entities.forEach(function (entity, index) {
                if ((
                        (entity.x === (pawnPiece.x + Direction.getdx(direction)))
                        && (entity.y === (pawnPiece.y + Direction.getdy(direction)))
                    ) || (
                        (entity.enpassan)
                        && (entity.enpassanX === (pawnPiece.x + Direction.getdx(direction)))
                        && (entity.enpassanY === (pawnPiece.y + Direction.getdy(direction)))
                    )) {

                    isValid = true;
                    if (entity.enpassan)
                        entity.enpassaned = true;
                }
            });

            if (!isValid)
                return false;
        }

        // if reached last line, promote pawn to knight, bishop, rook or queen
        var destinationY = pawnPiece.y + Direction.getdy(direction);
        if ((destinationY === 0 || destinationY === boardGameModule.Config.ROWS - 1)
            && (!pawnPiece.promote))
            pawnPiece.set("promote", true);
    }

    return true;
};

exports.Pawn = Pawn;
exports.get  = function (x, y, width, height, side) {
    return new Pawn(x, y, width, height, side);
};
