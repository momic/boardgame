/**
 * Screen class
 *
 * Container for entity objects
 */
function Screen(screenID) {
    this.constructorName = "Screen";
    this.screenID        = screenID;
    this.entities        = {};
}

/**
 * Add entity to screen
 */
Screen.prototype.addEntity = function (entityID, entity) {
    this.entities[entityID] = entity;
};

/**
 * Remove entity from screen
 */
Screen.prototype.removeEntity = function (entityID) {
    if (this.entities[entityID])
        delete this.entities[entityID];
};

/**
 * Get entity by entityID
 */
Screen.prototype.getEntityByID = function (entityID) {
    return this.entities[entityID];
};

/**
 * Draw screen entities
 */
Screen.prototype.draw = function () {
    for (var entityID in this.entities) {
        this.entities[entityID].draw();
    }
};

/**
 * Checks if this screen has screenID
 */
Screen.prototype.is = function (screenID) {
    return (this.screenID === screenID);
};
