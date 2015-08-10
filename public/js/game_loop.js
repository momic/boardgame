/**
 * Global variables
 */
var gameScreen = null;

/**
 * Main loop runned at fixed fps
 */
function drawCanvas() 
{       
    // draw game screen
    gameScreen.draw();
    
    // on frame draw
    gameScreen.onFrameDraw();
}

/**
 * On document ready
 */
$(document).ready(function() {
    gameScreen = new GameScreen();

    // clear canvas
    gameScreen.clearActiveScreen();
    
    // draw canvas every 30ms => 33fps
    setInterval(drawCanvas, 30);
});

/**
 * Keyboard controls now
 */ 
$(document).keydown(function(e){
    var key = e.which;
    // on key down
    gameScreen.onKeyDown(key);
})