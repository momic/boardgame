(function(exports){
/**
 * Player class
 */
function Player() {
	this.initialize();
}

/**
 * Initialize player
 */
Player.prototype.initialize = function() {
	this.set("side", false);
	this.set("nick", "guest");

	this.set("socketId", "");
	this.set("activeGameRoom", "");
	this.set("clientIp", "");
}

/**
 * Player setter
 */
Player.prototype.set = function (key, value) { 
    this[key] = value; 
}

exports.Player = Player;

})((typeof exports === 'undefined') ? this['playerModule']={} : exports);