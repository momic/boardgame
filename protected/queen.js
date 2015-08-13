var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

/**
 * Queen class
 */
function Queen(x, y, width, height, side) {
	Queen._super.constructor.call(this, x, y, width, height, side, 'queen');
}

utils.inherits(Queen, entity.Entity);

exports.Queen = Queen;
exports.get = function(x, y, width, height, side)
{
    return new Queen(x, y, width, height, side);
}