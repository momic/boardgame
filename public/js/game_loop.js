/**
 * Global variables
 */
var gameScreen = null;


/**
 * Main loop runned at fixed fps
 */
function drawCanvas() {
    // draw game screen
    gameScreen.draw();
}

/**
 * On document ready
 */
document.addEventListener('DOMContentLoaded', function () {
    gameScreen = new GameScreen();

    // clear canvas
    gameScreen.clearActiveScreen();

    // draw canvas every 30ms => 33fps
    setInterval(drawCanvas, 30);

    // check for arrived messages
    if (gameScreen.isChromeExtension)
        gameScreen.executeMessageQueue();
});
