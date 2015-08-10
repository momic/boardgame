/**
 * SpriteRepository class
 *
 * Class which holds sprites
 */
function SpriteRepository()
{
    // SpriteRepositories
	for(var initializer in boardGameModule.SpriteRepositories) {
		// just awseome :) aka. this.initChessPiecesSprite("chessPiecesSprite")
	  	this[initializer](boardGameModule.SpriteRepositories[initializer]); 
	}
}


/**
 * Chess pieces sprites
 */
SpriteRepository.prototype.initChessPiecesSprite = function(repositoryVar)
{
	var spriteRepo = this;
    var img = new Image();
    img.src = 'images/sprite.png';

    img.onload = function () {
		var sprite = new Sprite(this, this.width / 6, this.height / 2, [
		    // specify sprite locations
		    [0, 0],    // white king
		    [288, 0],  // white queen
		    [576, 0],  // white bishop
		    [864, 0],  // white knight
		    [1152, 0], // white rook
		    [1440, 0], // white pawn

		    [0, 288],    // black king
		    [288, 288],  // black queen
		    [576, 288],  // black bishop
		    [864, 288],  // black knight
		    [1152, 288], // black rook
		    [1440, 288], // black pawn
		]);

		spriteRepo[repositoryVar] = sprite;
    };

    img.onerror = function () {
        alert('The chess pieces sprite image could not be loaded.')
    }
}

