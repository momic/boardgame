var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

/**
 * King class
 */
function King(x, y, width, height, side) {
	King._super.constructor.call(this, x, y, width, height, side, 'king');
}

utils.inherits(King, entity.Entity);

exports.King = King;
exports.get = function(x, y, width, height, side)
{
    return new King(x, y, width, height, side);
}