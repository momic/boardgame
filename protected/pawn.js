var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

/**
 * Pawn class
 */
function Pawn(x, y, width, height, side) {
	Pawn._super.constructor.call(this, x, y, width, height, side, 'pawn');
}

utils.inherits(Pawn, entity.Entity);

exports.Pawn = Pawn;
exports.get = function(x, y, width, height, side)
{
    return new Pawn(x, y, width, height, side);
}