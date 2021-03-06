/**
 * ScreenRepository class
 *
 * Class which holds multiple screens
 */
function ScreenRepository() {
}

/**
 * Main menu screen
 */
ScreenRepository.prototype.mainMenuScreen = function () {
    var menuButtons = [];
    var startGameButton = new Button("Start Game", 0, 0, this.startGameButtonClick, "#777");
    menuButtons.push(startGameButton);

    // center menu
    var menuX    = Math.round((boardGameModule.Config.WIDTH - startGameButton.width) / 2);
    var menuY    = Math.round((boardGameModule.Config.HEIGHT - startGameButton.height * menuButtons.length) / 2);
    var mainMenu = new Menu(menuX, menuY, menuButtons);

    var mainMenuScreen = new Screen("mainMenuScreen");
    mainMenuScreen.addEntity("mainMenu", mainMenu);
    return mainMenuScreen;
};

/**
 * onClick method for new tree button
 */
ScreenRepository.prototype.startGameButtonClick = function () {
    gameScreen.setActiveScreen(gameScreen.screenRepository.gameBoardScreen());
};

/**
 * Gameboard screen
 */
ScreenRepository.prototype.gameBoardScreen = function () {
    // Gameboard instance
    var gameboard = new Gameboard(0, 0);
    if (!gameboard.active) {
        gameboard.statusBox.setText("Waiting for opponent to join...");
        gameboard.statusBox.set("x", Math.round((gameboard.width - gameboard.statusBox.width) / 2));
    }

    var gameBoardScreen = new Screen("gameBoardScreen");
    gameBoardScreen.addEntity("gameboard", gameboard);

    var gameType = (gameScreen.player.invitationGame) ? 'invitation_game' : 'ready_for_game';
    gameScreen.emit(gameType, gameScreen.player);

    return gameBoardScreen;
};
