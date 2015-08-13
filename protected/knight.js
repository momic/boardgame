var utils  = require('../public/js/inheritance_lib.js');
var entity = require('./entity.js');

/**
 * Knight class
 */
function Knight(x, y, width, height, side) {
	Knight._super.constructor.call(this, x, y, width, height, side, 'knight');
}

utils.inherits(Knight, entity.Entity);

exports.Knight = Knight;
exports.get = function(x, y, width, height, side)
{
    return new Knight(x, y, width, height, side);
}