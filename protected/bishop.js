var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

var boardGameModule = require('../public/js/config.js');
var Direction = boardGameModule.getDirection();

/**
 * Bishop class
 */
function Bishop(x, y, width, height, side) {
	Bishop._super.constructor.call(this, x, y, width, height, side, 'bishop');
}

utils.inherits(Bishop, entity.Entity);

/**
 * Check entity move
 */
Bishop.prototype.checkMove = function (entities, path) {
	// bishop can't move more than seven fields
	if (path.length > 7)
		return false;

	// valid directions
	var isValid = true;
	var bishopDirection = path[path.length - 1];
	if ((bishopDirection != Direction.UPLEFT) && (bishopDirection != Direction.UPRIGHT)
		&& (bishopDirection != Direction.DOWNLEFT) && (bishopDirection != Direction.DOWNRIGHT))
		isValid = false

	path.forEach(function(direction, index) {
		if (direction != bishopDirection)
			isValid = false
	});

	if (!isValid)
		return false;

	// check for piece blocking multi step move
	// allow last step to be oponent piece
	var isValid = true;
	var bishopPiece = this;
	var boardX = bishopPiece.x;
	var boardY = bishopPiece.y;
	path.forEach(function(direction, directionIndex) {
		boardX += Direction.getdx(direction);
		boardY += Direction.getdy(direction);
		entities.forEach(function(entity, index) {
			if ((entity.x == boardX) && (entity.y == boardY) && 
				((directionIndex < (path.length - 1)) || (entity.side == bishopPiece.side)))
				isValid = false;
		});
	});

    return isValid;
}


exports.Bishop = Bishop;
exports.get = function(x, y, width, height, side)
{
    return new Bishop(x, y, width, height, side);
}