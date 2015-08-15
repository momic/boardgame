var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

var boardGameModule = require('../public/js/config.js');
var Direction = boardGameModule.getDirection();

/**
 * Queen class
 */
function Queen(x, y, width, height, side) {
	Queen._super.constructor.call(this, x, y, width, height, side, 'queen');
}

utils.inherits(Queen, entity.Entity);

/**
 * Check entity move
 */
Queen.prototype.checkMove = function (entities, path) {
	// queen can't move more than seven fields
	if (path.length > 7)
		return false;

	// valid directions
	var isValid = true;
	var queenDirection = path[path.length - 1];
	path.forEach(function(direction, index) {
		if (direction != queenDirection)
			isValid = false
	});

	if (!isValid)
		return false;

	// check for piece blocking multi step move
	// allow last step to be oponent piece
	var isValid = true;
	var queenPiece = this;
	var boardX = queenPiece.x;
	var boardY = queenPiece.y;
	path.forEach(function(direction, directionIndex) {
		boardX += Direction.getdx(direction);
		boardY += Direction.getdy(direction);
		entities.forEach(function(entity, index) {
			if ((entity.x == boardX) && (entity.y == boardY) && 
				((directionIndex < (path.length - 1)) || (entity.side == queenPiece.side)))
				isValid = false;
		});
	});

    return isValid;
}

exports.Queen = Queen;
exports.get = function(x, y, width, height, side)
{
    return new Queen(x, y, width, height, side);
}