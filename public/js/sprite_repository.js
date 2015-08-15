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

    var imgPath;
	var clientWidth = document.documentElement.clientWidth;
	var spriteLocations = [];
    if (clientWidth < 768) {
		imgPath = 'images/sprite_768.png';
		spriteLocations = [
		    [0, 0],   // white king
		    [40, 0],  // white queen
		    [80, 0],  // white bishop
		    [120, 0], // white knight
		    [160, 0], // white rook
		    [200, 0], // white pawn

		    [0, 40],   // black king
		    [40, 40],  // black queen
		    [80, 40],  // black bishop
		    [120, 40], // black knight
		    [160, 40], // black rook
		    [200, 40], // black pawn
		];
	} 
	else if (clientWidth < 992) { // 48
		imgPath = 'images/sprite_992.png';
		spriteLocations = [
		    [0, 0],   // white king
		    [48, 0],  // white queen
		    [96, 0],  // white bishop
		    [144, 0], // white knight
		    [192, 0], // white rook
		    [240, 0], // white pawn

		    [0, 48],   // black king
		    [48, 48],  // black queen
		    [96, 48],  // black bishop
		    [144, 48], // black knight
		    [192, 48], // black rook
		    [240, 48], // black pawn
		];
		boardGameModule.Config.update(48, 48, 1);
	}
	else if (clientWidth < 1200) { // 56
		imgPath = 'images/sprite_1200.png';
		spriteLocations = [
		    [0, 0],   // white king
		    [56, 0],  // white queen
		    [112, 0],  // white bishop
		    [168, 0], // white knight
		    [224, 0], // white rook
		    [280, 0], // white pawn

		    [0, 56],   // black king
		    [56, 56],  // black queen
		    [112, 56],  // black bishop
		    [168, 56], // black knight
		    [224, 56], // black rook
		    [280, 56], // black pawn
		];
		boardGameModule.Config.update(56, 56, 2);
	}
	else {
		imgPath = 'images/sprite.png'; //64
		spriteLocations = [
		    [0, 0],    // white king
		    [64, 0],  // white queen
		    [128, 0],  // white bishop
		    [192, 0],  // white knight
		    [256, 0], // white rook
		    [320, 0], // white pawn

		    [0, 64],    // black king
		    [64, 64],  // black queen
		    [128, 64],  // black bishop
		    [192, 64],  // black knight
		    [256, 64], // black rook
		    [320, 64], // black pawn
		];
		boardGameModule.Config.update(64, 64, 2);
	}
	img.src = imgPath;

    img.onload = function () {
		var sprite = new Sprite(this, this.width / 6, this.height / 2, spriteLocations);
		spriteRepo[repositoryVar] = sprite;
    };

    img.onerror = function () {
        alert('The chess pieces sprite image could not be loaded.')
    }
}

