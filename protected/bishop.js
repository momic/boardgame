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
 * Check if entity attacks tiles
 */
Bishop.prototype.isAttacking = function (entities, tileX, tileY, pieceToMove, destinationX, destinationY) {
	var diffX = Math.abs(this.x - tileX);
	var diffY = Math.abs(this.y - tileY);

	if (diffX != diffY)
		return false;

	var minX = Math.min(this.x, tileX);
	var minY = Math.min(this.y, tileY);

	var i = this.x;
	var j = this.y;
	var incrX = (minX == this.x) ? 1 : -1;
	var incrY = (minY == this.y) ? 1 : -1;
	var tilesToCheck = {};
	var attacks = true;
	while (Math.abs(i - tileX) > 1)	{
		i += incrX;
		j += incrY;
		
		tilesToCheck[i] = j;
		if ((destinationX == i) && (destinationY == j))
			attacks = false;
	}

	if (!attacks)
		return false;
	
	entities.forEach(function(entity, entityIndex) {
		var x = (entity.isEqual(pieceToMove)) ? destinationX : entity.x;
		var y = (entity.isEqual(pieceToMove)) ? destinationY : entity.y;

		if (tilesToCheck[x] == y)
			attacks = false;
	});

    return attacks;
}


/**
 * Check entity move
 */
Bishop.prototype.checkMove = function (entities, path) {
	var isValid = Bishop._super.checkMove.call(this, entities, path);
	if (!isValid)
		return false;

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