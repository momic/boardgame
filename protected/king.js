var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

var boardGameModule = require('../public/js/config.js');
var Direction = boardGameModule.getDirection();

/**
 * King class
 */
function King(x, y, width, height, side) {
	King._super.constructor.call(this, x, y, width, height, side, 'king');
}

utils.inherits(King, entity.Entity);

/**
 * Check entity move
 */
King.prototype.checkMove = function (entities, path) {
	// king can't move more than one field
	if (path.length > 1)
		return false;

	// TODO: chess rochade (big and small)
	// check that fields are not under attack

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
			if ((entity.x == boardX) && (entity.y == boardY) && (entity.side == queenPiece.side))
				isValid = false;
		});
	});

    return isValid;
}


exports.King = King;
exports.get = function(x, y, width, height, side)
{
    return new King(x, y, width, height, side);
}