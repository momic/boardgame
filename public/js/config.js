(function (exports) {
    /**
     * Config
     */
    var Config = {
        COLUMNS: 8, // number of columns to display
        ROWS:    8,

        TILE_WIDTH:  40,
        TILE_HEIGHT: 40,
        TILE_GAP:    1,

        HOST: "http://104.236.179.244:3000", // "http://localhost:3000"

        CONNECTIONS_LIMIT: 6144,

        update: function (tileWidth, tileHeight, tileGap) {
            this.TILE_WIDTH  = tileWidth;
            this.TILE_HEIGHT = tileHeight;
            this.TILE_GAP    = tileGap;
            this.WIDTH       = this.TILE_GAP + this.COLUMNS * (this.TILE_WIDTH + this.TILE_GAP);
            this.HEIGHT      = this.TILE_GAP + this.ROWS * (this.TILE_HEIGHT + this.TILE_GAP);
        },
    };

    // canvas size
    Config.WIDTH  = Config.TILE_GAP + Config.COLUMNS * (Config.TILE_WIDTH + Config.TILE_GAP);
    Config.HEIGHT = Config.TILE_GAP + Config.ROWS * (Config.TILE_HEIGHT + Config.TILE_GAP);

    // directions
    var Direction = {
        STOP: [0, 0, 0],

        UP:    [1, 0, -1],
        DOWN:  [2, 0, +1],
        LEFT:  [3, -1, 0],
        RIGHT: [4, +1, 0],

        UPLEFT:    [5, -1, -1],
        UPRIGHT:   [6, +1, -1],
        DOWNLEFT:  [7, -1, +1],
        DOWNRIGHT: [8, +1, +1],

        getdx: function (dir) {
            return dir[1];
        },

        getdy: function (dir) {
            return dir[2];
        },

        /**
         * Pick random direction
         */
        getRandomDirection: function () {
            var index = Math.floor(Math.random() * 8) + 1;
            for (var prop in this) {
                if (this[prop][0] === index) {
                    return this[prop];
                }
            }
        }
    };

    // sprites
    exports.SpriteRepositories = {
        "initChessPiecesSprite": "chessPiecesSprite"
    };

    exports.getDirection = function () {
        return Direction;
    };

    exports.Direction = Direction;
    exports.Config    = Config;

})((typeof exports === 'undefined') ? this['boardGameModule'] = {} : exports);
