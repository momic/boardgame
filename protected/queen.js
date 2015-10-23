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
 * If we move pieceToMove to it's new destination [destinationX, destinationY]
 * Check if this entity attacks field [tileX, tileY]
 * Check that other entities does not block attack line
 */
Queen.prototype.isAttacking = function (entities, tileX, tileY, pieceToMove, destinationX, destinationY) {
	var diffX = Math.abs(this.x - tileX);
	var diffY = Math.abs(this.y - tileY);

	var minX = Math.min(this.x, tileX);
	var minY = Math.min(this.y, tileY);	

	if (diffX == 0 && diffY == 0)
		return false;
	else if (diffX > 0 && diffY > 0 && (diffX != diffY)) // only diagonal
		return false;
	else {} // horizontal and vertical

	var i = this.x;
	var j = this.y;
	var incrX = (diffX == 0) ? 0 : ((minX == this.x) ? 1 : -1);
	var incrY = (diffY == 0) ? 0 : ((minY == this.y) ? 1 : -1);	
	var condition = (diffX == 0) ? Math.abs(j - tileY) : Math.abs(i - tileX);

	var tilesToCheck = [];
	var attacks = true;
	while (condition > 1)	{
		i += incrX;
		j += incrY;
		
		tilesToCheck.push([i, j]);
		if ((destinationX == i) && (destinationY == j))
			attacks = false;

		condition = (diffX == 0) ? Math.abs(j - tileY) : Math.abs(i - tileX);
	}

	if (!attacks)
		return false;
	
	entities.forEach(function(entity, entityIndex) {
		var x = (entity.isEqual(pieceToMove)) ? destinationX : entity.x;
		var y = (entity.isEqual(pieceToMove)) ? destinationY : entity.y;

		tilesToCheck.forEach(function (tile, tileIndex) {
			if ((tile[0] == x) && (tile[1] == y))
				attacks = false;			
		});
	});

    return attacks;
}

/**
 * Check entity move
 */
Queen.prototype.checkMove = function (entities, path) {
	var isValid = Queen._super.checkMove.call(this, entities, path);
	if (!isValid)
		return false;

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