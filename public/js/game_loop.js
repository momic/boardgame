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


    var nickName = localStorage.getItem('nickName');
    if (localStorage.getItem('nickName')) {
        $('#left-header-text').text('Hello ' + nickName);
        gameScreen.player.set("nick", nickName);
    } else {
        // player name modal
        var $nickModal = $('#playerNameModal');
        $nickModal.find('form').submit(function(e) {
          e.preventDefault();
          $nickModal.modal('hide');
        });

        $nickModal.modal('toggle')
            .on('shown.bs.modal', function(e) {
                $('#nick-name').focus();
            })
            .on('hidden.bs.modal', function (e) {
                var nickName = $('#nick-name').val().trim();
                // If entered put the object into storage
                if (nickName)
                    localStorage.setItem('nickName', nickName);

                nickName = (nickName) ? nickName : 'guest';
                $('#left-header-text').text('Hello ' + nickName);
                gameScreen.player.set("nick", nickName);
            });        
    }
});

/**
 * Keyboard controls now
 */ 
$(document).keydown(function(e){
    var key = e.which;
    // on key down
    gameScreen.onKeyDown(key);
})