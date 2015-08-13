function Sprite(img, spriteWidth, spriteHeight, positions) {
  this.img = img;
  this.width = spriteWidth;
  this.height = spriteHeight;
  this.positions = positions;

  this.entityWidth = boardGameModule.Config.TILE_WIDTH;
  this.entityHeight = boardGameModule.Config.TILE_HEIGHT;
}

Sprite.prototype.draw = function(ctxt, index, x, y) {
  x = utils.isUndefined(x, 0);
  y = utils.isUndefined(y, 0);  
  var pos = this.positions[index];
  ctxt.drawImage(this.img, pos[0], pos[1], this.width, this.height, x, y, this.entityWidth, this.entityHeight);
}
