/**
 * ActiveEntity class
 */
function ActiveEntity(x, y) {
    ActiveEntity._super.constructor.call(this, x, y);

    // create entity in state of no motion 
    // and reset movementOffset to zero
    this.stop();
    
    // set two speed velocities
    this.set("defaultSpeed", 8);
    this.set("fastSpeed", 16);    

    // default values
    this.set("path", []);
    this.set("gap", boardGameModule.Config.TILE_GAP);
}

inherits(ActiveEntity, Entity);

/**
 * Apply movement and process it's reactions.
 */
ActiveEntity.prototype.applyMovement = function () {
    // even if we could we would not move;
    if (!this.isMoving()) {
        return;
    }
    
    // calculate deltas
    dx = boardGameModule.Direction.getdx(this.direction);
    deltax = dx * this.speed;
    
    dy = boardGameModule.Direction.getdy(this.direction);
    deltay = dy * this.speed;        
     
    // move this.speed of pixels only if this translation will not complete the move
    if (!this.isMoveCompleted(dx)) {
        this.setPosition(this.x + deltax, this.y + deltay);
        return;
    }

    // calculate the rest of the move
    deltax = boardGameModule.Direction.getdx(this.direction) * (this.speed - this.movementOffset);
    deltay = boardGameModule.Direction.getdy(this.direction) * (this.speed - this.movementOffset);

    // complete the move
    this.setPosition(this.x + deltax, this.y + deltay);

    // still on path?
    var walking = this.walkPath(this.speed);
    if (!walking)
        this.stop();
}

/**
 * Determine if this entity has move at least a whole tile.
 * 
 * @param dx X-axis direction coefficient
 * @return true if moved a whole tile.
 */
ActiveEntity.prototype.isMoveCompleted = function(dx) {
    // add speed to movementOffset
    this.movementOffset += this.speed;
    
    // calculate moveSize to complete the move
    // we want to move for complete width or height pixels
    moveSize = 0;
    if (dx == 0) {
        moveSize += this.height + this.gap;
    } else {
        moveSize += this.width + this.gap;
    }
    
    // check if move is finished
    // and recalculate movementOffset
    if (this.movementOffset >= moveSize) {
            this.movementOffset -= moveSize;
            return true;
    } else {
            return false;
            
    }
}

/**
 * Stops entity movement.
 * 
 * direction - facing direction
 * speed - current speed
 * movementOffset - amount of uncommitted tile movement.
 */
ActiveEntity.prototype.stop = function () {
    this.set("direction", boardGameModule.Direction.STOP);
    this.set("speed", 0);
    this.set("movementOffset", 0);
}

/**
 * Sets direction and speed
 */
ActiveEntity.prototype.setMoveVector = function (direction, speed) {    
    speed = isUndefined(speed, this.defaultSpeed);

    if (this.direction != direction) {
        this.set("direction", direction);
    }

    if (this.speed != speed) {
        this.set("speed", speed);    
    }
}

/**
 * Set path and speed
 */
ActiveEntity.prototype.setPath = function (path, speed) {    
    this.set("path", path);
    this.walkPath(speed);
}


/**
 * Walk the path
 */
ActiveEntity.prototype.walkPath = function (speed) {
    var walking = this.path.length > 0;
    if (walking) {
        direction = this.path.pop();
        this.set("movementOffset", 0);        
        this.setMoveVector(direction, speed);
    }

    return walking;
}


/**
 * Check if tile is moving
 */
ActiveEntity.prototype.isMoving = function () {
    return ((this.direction != boardGameModule.Direction.STOP) && (this.speed != 0));
}