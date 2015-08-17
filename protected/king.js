var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

var boardGameModule = require('../public/js/config.js');
var Direction = boardGameModule.getDirection();

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

	// king can't move more than one field
	if (path.length > 2) {
		return false;
	}
	else if (path.length > 1) {
		// TODO: check that fields are not under attack
		// check that king is not under chess => no other move can be made

		// check king move
		if ((kingPiece.moved) || (path[0] != path[1]) || ((path[1] != Direction.LEFT) && (path[1] != Direction.RIGHT)))
			return false;

		var rightRochade = (path[1] == Direction.RIGHT);
		var rookPositionX = (rightRochade) ? (boardGameModule.Config.ROWS - 1) : 0;

		// try to find proper rook
		var rook = false;
		entities.forEach(function(entity, entityIndex) {
			if ((entity.clazz == "rook") && (entity.side == kingPiece.side) && 
				(entity.y == kingPiece.y) && (entity.x == rookPositionX))
				rook = entity;
		});

		if (rook === false)
			return false;

		// calculate rook path
		var rookPath = [];
		var rookDirection = (rightRochade) ? Direction.LEFT : Direction.RIGHT;
		var rookMoveCount = (rightRochade) ? 2 : 3;
		for(i=0; i<rookMoveCount; i++)
			rookPath.push(rookDirection);

		// set rook path
		rook.set("path", rookPath);
		entitiesChanged.push(rook);
	}
	else {
		// check for piece blocking multi step move
		// allow last step to be oponent piece
		var isValid = true;
		var boardX = kingPiece.x;
		var boardY = kingPiece.y;
		path.forEach(function(direction, directionIndex) {
			boardX += Direction.getdx(direction);
			boardY += Direction.getdy(direction);
			entities.forEach(function(entity, index) {
				if ((entity.x == boardX) && (entity.y == boardY) && (entity.side == kingPiece.side))
					isValid = false;
			});
		});

		if (!isValid)
			return false;
	}

	kingPiece.set("moved", true);
    return true;
}


exports.King = King;
exports.get = function(x, y, width, height, side)
{
    return new King(x, y, width, height, side);
}