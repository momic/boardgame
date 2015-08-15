var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

var boardGameModule = require('../public/js/config.js');
var Direction = boardGameModule.getDirection();


/**
 * Knight class
 */
function Knight(x, y, width, height, side) {
	Knight._super.constructor.call(this, x, y, width, height, side, 'knight');
}

utils.inherits(Knight, entity.Entity);

/**
 * Check entity move
 */
Knight.prototype.checkMove = function (entities, path) {
	// knight always moves four fields
	if (path.length != 2)
		return false;

	// valid directions
	if ((path[1] != Direction.UP) && (path[1] != Direction.DOWN) && 
		(path[1] != Direction.LEFT) && (path[1] != Direction.RIGHT))
		return false;

	if (path[1] == Direction.UP) {
		if ((path[0] != Direction.UPRIGHT) && (path[0] != Direction.UPLEFT))
			return false;
	}
	else if (path[1] == Direction.DOWN) {
		if ((path[0] != Direction.DOWNRIGHT) && (path[0] != Direction.DOWNLEFT))
			return false;
	}
	else if (path[1] == Direction.LEFT) {
		if ((path[0] != Direction.UPLEFT) && (path[0] != Direction.DOWNLEFT))
			return false;
	}	
	else if (path[1] == Direction.RIGHT) {
		if ((path[0] != Direction.UPRIGHT) && (path[0] != Direction.DOWNRIGHT))
			return false;
	}

	// allow last step to be oponent piece
	var isValid = true;
	var knightPiece = this;
	var boardX = knightPiece.x;
	var boardY = knightPiece.y;
	path.forEach(function(direction, directionIndex) {
		boardX += Direction.getdx(direction);
		boardY += Direction.getdy(direction);
		if (directionIndex == (path.length - 1))
			entities.forEach(function(entity, index) {
				if ((entity.x == boardX) && (entity.y == boardY) && 
					((directionIndex < (path.length - 1)) || (entity.side == knightPiece.side)))
					isValid = false;
			});
	});

    return isValid;
}

exports.Knight = Knight;
exports.get = function(x, y, width, height, side)
{
    return new Knight(x, y, width, height, side);
}