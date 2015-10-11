/**
 * ScreenRepository class
 *
 * Class which holds multiple screens
 */
function ScreenRepository()
{
}

/**
 * Main menu screen
 */
ScreenRepository.prototype.mainMenuScreen = function()
{
	menuButtons = [];
	var startGameButton = new Button("Start Game", 0, 0, this.startGameButtonClick, "#777");
	menuButtons.push(startGameButton);
	var fullScreenButton = new Button("Full Screen", 0, 0, this.fullScreenButtonClick, "#777");
	menuButtons.push(fullScreenButton);
	// var optionsButton = new Button("Options", 0, 0, this.optionsButtonClick, "#999");
	// menuButtons.push(optionsButton);
	// var helpButton = new Button("Help", 0, 0, this.helpButtonClick, "#777");
	// menuButtons.push(helpButton);

	// center menu
	var menuX = Math.round((boardGameModule.Config.WIDTH - startGameButton.width) / 2);
	var menuY = Math.round((boardGameModule.Config.HEIGHT - startGameButton.height * menuButtons.length) / 2);
	var mainMenu = new Menu(menuX, menuY, menuButtons);

	var mainMenuScreen = new Screen("mainMenuScreen");
	mainMenuScreen.addEntity("mainMenu", mainMenu);
	return mainMenuScreen;
}

/**
 * onClick method for new tree button
 */
ScreenRepository.prototype.startGameButtonClick = function() {
	gameScreen.setActiveScreen(gameScreen.screenRepository.gameBoardScreen());
}

/**
 * onClick method for full screen button click
 */
ScreenRepository.prototype.fullScreenButtonClick = function() {
	gameScreen.enterFullScreen();
}

/**
 * onClick method for options button click
 */
ScreenRepository.prototype.optionsButtonClick = function() {
}

/**
 * onClick method for help button click
 */
ScreenRepository.prototype.helpButtonClick = function() {
}


/**
 * Gameboard screen
 */
ScreenRepository.prototype.gameBoardScreen = function()
{
	// Gameboard instance
	var gameboard = new Gameboard(0, 0);
	if (!gameboard.active) {
		gameboard.statusBox.setText("Waiting for opponent to join...");
		gameboard.statusBox.set("x", Math.round((gameboard.width - gameboard.statusBox.width) / 2));		
	}

	var gameBoardScreen = new Screen("gameBoardScreen");
	gameBoardScreen.addEntity("gameboard", gameboard);

	gameScreen.socket.emit("ready_for_game", gameScreen.player);
	
	return gameBoardScreen;
}