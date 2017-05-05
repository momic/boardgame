(function (exports) {
    /**
     * Player class
     */
    function Player() {
        this.set("constructorName", "Player");
        this.initialize();
    }

    /**
     * Initialize player
     */
    Player.prototype.initialize = function () {
        this.set("side", false);
        this.set("nick", "guest");

        this.set("invitationGame", false);
        this.set("invitationID", false);

        this.set("socketId", "");
        this.set("activeGameRoom", "");
        this.set("clientIp", "");
    };

    /**
     * Player setter
     */
    Player.prototype.set = function (key, value) {
        this[key] = value;
    };

    /**
     * Player setter
     */
    Player.prototype.opponent = function (activeGameRooms) {
        var room = activeGameRooms[this.activeGameRoom];
        if (room) {
            if (room.whitePlayer.socketId === this.socketId) {
                return room.blackPlayer;
            }

            return room.whitePlayer;
        }

        return null;
    };

    exports.Player = Player;

})((typeof exports === 'undefined') ? this['playerModule'] = {} : exports);
