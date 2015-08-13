var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

/**
 * Bishop class
 */
function Bishop(x, y, width, height, side) {
	Bishop._super.constructor.call(this, x, y, width, height, side, 'bishop');
}

utils.inherits(Bishop, entity.Entity);

exports.Bishop = Bishop;
exports.get = function(x, y, width, height, side)
{
    return new Bishop(x, y, width, height, side);
}