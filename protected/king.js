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

		// check that king is not under attack by oponent entities
		var isValid = true;
		var boardX = kingPiece.x;
		var destinationX = kingPiece.x + Direction.getdx(path[0]) * 2;

		entities.forEach(function(entity, index) {
			if ((entity.side != kingPiece.side) && 
				(entity.isAttacking(entities, kingPiece.x, kingPiece.y, destinationX, kingPiece.y))) {
				isValid = false;
			}
		});

		if (!isValid)
			return false;

		// calculate rook path
		var rookPath = [];
		var rookDirection = (rightRochade) ? Direction.LEFT : Direction.RIGHT;
		var rookMoveCount = (rightRochade) ? 2 : 3;
		for(i=0; i<rookMoveCount; i++)
			rookPath.push(rookDirection);

		// check that fields are not under attack by oponent entities
		// check from rook side because of possibility of 3 moves
		var isValid = true;
		var boardX = rook.x;
		var destinationX = rook.x + Direction.getdx(rookDirection) * rookMoveCount;
		rookPath.forEach(function(direction, directionIndex) {
			boardX += Direction.getdx(direction);
			entities.forEach(function(entity, index) {
				if ((entity.side != kingPiece.side) && 
					(entity.isAttacking(entities, boardX, kingPiece.y, destinationX, kingPiece.y))) {
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
		// allow last step to be oponent piece
		var isValid = true;
		var boardX = kingPiece.x;
		var boardY = kingPiece.y;
		path.forEach(function(direction, directionIndex) {
			boardX += Direction.getdx(direction);
			boardY += Direction.getdy(direction);
			entities.forEach(function(entity, index) {
				// check for piece blocking multi step move
				if ((entity.x == boardX) && (entity.y == boardY) && (entity.side == kingPiece.side))
					isValid = false;
				// check that field is not under attack
				if ((entity.side != kingPiece.side) && 
					(entity.isAttacking(entities, boardX, boardY, boardX, boardY))) {
					isValid = false;
				}
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