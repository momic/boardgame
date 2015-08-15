var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

var boardGameModule = require('../public/js/config.js');
var Direction = boardGameModule.getDirection();


/**
 * Rook class
 */
function Rook(x, y, width, height, side) {
	Rook._super.constructor.call(this, x, y, width, height, side, 'rook');
}

utils.inherits(Rook, entity.Entity);

/**
 * Check entity move
 */
Rook.prototype.checkMove = function (entities, path) {
	// rook can't move more than seven fields
	if (path.length > 7)
		return false;

	// valid directions
	var isValid = true;
	path.forEach(function(direction, index) {
		if (((Direction.getdy(direction) < 0) 
			&& (direction != Direction.UP)) 
		|| ((Direction.getdy(direction) > 0) 
			&& (direction != Direction.DOWN))
		|| ((Direction.getdx(direction) < 0) 
			&& (direction != Direction.LEFT))
		|| ((Direction.getdx(direction) > 0) 
			&& (direction != Direction.RIGHT)))

			isValid = false
	});

	if (!isValid)
		return false;

	// check for piece blocking multi step move
	// allow last step to be oponent piece
	var isValid = true;
	var rookPiece = this;
	var boardX = rookPiece.x;
	var boardY = rookPiece.y;
	path.forEach(function(direction, directionIndex) {
		boardX += Direction.getdx(direction);
		boardY += Direction.getdy(direction);
		entities.forEach(function(entity, index) {
			if ((entity.x == boardX) && (entity.y == boardY) && 
				((directionIndex < (path.length - 1)) || (entity.side == rookPiece.side)))
				isValid = false;
		});
	});

    return isValid;
}

exports.Rook = Rook;
exports.get = function(x, y, width, height, side)
{
    return new Rook(x, y, width, height, side);
}