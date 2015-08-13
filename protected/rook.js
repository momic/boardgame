var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

/**
 * Rook class
 */
function Rook(x, y, width, height, side) {
	Rook._super.constructor.call(this, x, y, width, height, side, 'rook');
}

utils.inherits(Rook, entity.Entity);

exports.Rook = Rook;
exports.get = function(x, y, width, height, side)
{
    return new Rook(x, y, width, height, side);
}