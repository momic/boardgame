/**
 * GameScreen class
 */
function GameScreen() {
    // Chrome extension
    this.isChromeExtension = ((typeof window.chrome !== 'undefined') && (typeof chrome.extension !== 'undefined'));

    // Root element
    this.initDocumentRoot();

    // Socket
    if (this.isChromeExtension)
        this.initExtensionListener();
    else
        this.initSocketIO();

    // Dropup
    this.initDropupElements();

    // Sprites
    this.spriteRepository = new SpriteRepository();

    // Canvas
    this.initCanvasElement();

    // Screens
    this.screenRepository = new ScreenRepository();

    // Player
    if (this.isChromeExtension)
    // load from background (extension only)
        this.player = this.loadPlayer();

    if (!this.player) {
        // regular player initialize
        this.player = new playerModule.Player();
        this.loadNickName();

        if (this.isChromeExtension)
        // store to background (extension only)
            this.storePlayer();
    }

    // Active screen
    if (this.isChromeExtension) {
        this.activeScreen = this.loadActiveScreen();

        // Reload nicks
        var gameboard = this.activeScreen.entities.gameboard;
        if (gameboard && gameboard.active) {
            this.documentRoot.find('#left-header-text').text('White: ' + gameboard.whitePlayerNick);
            this.documentRoot.find('#right-header-text').text('Black: ' + gameboard.blackPlayerNick);
        }
        else
            this.documentRoot.find('#left-header-text').text('Hello ' + this.player.nick);

        chrome.browserAction.setBadgeText({text: ""});
    }
    else
        this.setActiveScreen(this.screenRepository.mainMenuScreen());
}

/**
 * Document root initialization
 */
GameScreen.prototype.initDocumentRoot = function () {
    this.documentRoot = $(window.document.documentElement);
};

/**
 * Load nick name
 */
GameScreen.prototype.loadNickName = function () {
    var nickName      = localStorage.getItem('nickName');
    var $documentRoot = this.documentRoot;
    if (nickName) {
        $documentRoot.find('#left-header-text').text('Hello ' + nickName);
        this.player.set("nick", nickName);
    } else {
        // player name modal
        var $nickModal = $documentRoot.find('#playerNameModal');
        $nickModal.find('form').submit(function (e) {
            e.preventDefault();
            $nickModal.modal('hide');
        });

        $nickModal.modal('toggle')
            .on('shown.bs.modal', function (e) {
                $nickModal.find('#nick-name').focus();
            })
            .on('hidden.bs.modal', function (e) {
                var nickName = $nickModal.find('#nick-name').val().trim();
                // If entered put the object into storage
                if (nickName)
                    localStorage.setItem('nickName', nickName);

                nickName = (nickName) ? nickName : 'guest';
                $documentRoot.find('#left-header-text').text('Hello ' + nickName);
                gameScreen.player.set("nick", nickName);
            });
    }
};

/**
 * Init dropup elements
 */
GameScreen.prototype.initDropupElements = function () {
    $("#new-game-button").mousedown(function () {
        gameScreen.player.invitationGame = false;
        gameScreen.player.invitationID   = false;

        gameScreen.setActiveScreen(gameScreen.screenRepository.gameBoardScreen());
        gameScreen.documentRoot.find('#left-header-text').text('Hello ' + gameScreen.player.nick);
        gameScreen.documentRoot.find('#right-header-text').text('');
    });
    $("#send-invitation-button").mousedown(function () {
        gameScreen.player.invitationGame = true;
        gameScreen.player.invitationID   = false;

        gameScreen.setActiveScreen(gameScreen.screenRepository.gameBoardScreen());
        gameScreen.documentRoot.find('#left-header-text').text('Hello ' + gameScreen.player.nick);
        gameScreen.documentRoot.find('#right-header-text').text('');
    });

    // invitaion ID modal
    var $invitationIDModal = this.documentRoot.find('#invitationIDModal');
    $invitationIDModal.find('form').submit(function (e) {
        e.preventDefault();
        $invitationIDModal.modal('hide');
    });

    $invitationIDModal.on('shown.bs.modal', function (e) {
            $invitationIDModal.find('#invitation-id').focus();
        })
        .on('hidden.bs.modal', function (e) {
            var invitationID = $invitationIDModal.find('#invitation-id').val().trim();
            // If entered put the object into storage
            if (invitationID) {
                gameScreen.player.set("invitationID", invitationID);

                gameScreen.setActiveScreen(gameScreen.screenRepository.gameBoardScreen());
                gameScreen.documentRoot.find('#left-header-text').text('Hello ' + gameScreen.player.nick);
                gameScreen.documentRoot.find('#right-header-text').text('');
            }
        });


    $("#accept-invitation-button").mousedown(function () {
        gameScreen.player.invitationGame = true;
        $invitationIDModal.modal('toggle');
    });
    $("#full-screen-button").mousedown(function () {
        gameScreen.enterFullScreen();
    });
};

/**
 * Canvas initialization
 */
GameScreen.prototype.initCanvasElement = function () {
    var $documentRoot = this.documentRoot;
    this.canvas       = $documentRoot.find("#canvas")[0];
    this.setCanvasSize();

    this.context = this.canvas.getContext('2d');

    this.canvas.addEventListener("touchstart", this.onMouseDown);
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
};

/**
 * Get mouse pos relative to canvas pos
 */
GameScreen.prototype.getRelativeMousePos = function (evt) {
    canoffset = $(this.canvas).offset();
    posX      = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
    posY      = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

    return {
        x: posX,
        y: posY
    };
};

/**
 * onMouseMove event for hover tooltips and cursor changes
 */
GameScreen.prototype.onMouseMove = function (evt) {
};

/**
 * onMouseDown event for mouse/touch interaction
 */
GameScreen.prototype.onMouseDown = function (evt) {
    evt.stopPropagation();
    // evt.preventDefault();

    var mousePos = gameScreen.getRelativeMousePos(evt);

    var candidateControls = [];
    var candidateEntities = [];

    Object.getOwnPropertyNames(gameScreen.activeScreen.entities).forEach(function (entityID) {
        var entity = gameScreen.activeScreen.entities[entityID];
        if (entity.contains(mousePos.x, mousePos.y)) {
            if (entity instanceof Gameboard) {
                candidateEntities.push(entityID);
            } else {
                candidateControls.push(entityID);
            }
        }
    });

    if (candidateControls.length) {
        // TODO: user for instead of forEach to exit the loop when tile is found
        candidateControls.forEach(function (entityID) {
            var entity = gameScreen.activeScreen.entities[entityID];
            if (entity instanceof Button) {
                // button is clicked - call onClick handler
                entity.onClick();
            } else if (entity instanceof Menu) {
                // menu was clicked - call onClick handler of appropriate button
                entity.buttons.forEach(function (button) {
                    if (button.contains(mousePos.x, mousePos.y)) {
                        button.onClick();
                    }
                });
            }
        });
    } else {
        candidateEntities.forEach(function (entityID) {
            var entity = gameScreen.activeScreen.entities[entityID];
            if (entity instanceof Gameboard && entity.active) {
                var tileClicked = false;
                var tileToMove  = false;

                // tile is clicked - open context menu
                // TODO: user for instead of forEach to exit the loop when tile is found
                entity.tiles.forEach(function (tile, tileIndex) {
                    if (tile.contains(mousePos.x, mousePos.y)
                        && (entity.sideToMove === tile.side)
                        && (entity.sideToMove === gameScreen.player.side)) {

                        tileClicked = true;
                        // stroke that entity
                        tile.toggleSelected();
                    } else {
                        if (tile.selected) {
                            tile.toggleSelected();
                            if (entity.sideToMove === tile.side)
                                tileToMove = tile;
                        }
                    }
                });

                if (!tileClicked && tileToMove !== false) {
                    var moveProperties = {};

                    if (entity.flipped) {
                        // clone tileToMove and mousePos and flipp coordinates
                        var flippedMousePosX = entity.width - mousePos.x;
                        var flippedMousePosY = entity.height - mousePos.y;
                        var flippedMousePos  = {};
                        flippedMousePos.x    = flippedMousePosX;
                        flippedMousePos.y    = flippedMousePosY;

                        moveProperties.mousePos   = flippedMousePos;
                        moveProperties.tileToMove = tileToMove.getFlippedTile(entity);
                    }
                    else {
                        moveProperties.mousePos   = mousePos;
                        moveProperties.tileToMove = tileToMove;
                    }

                    gameScreen.emit('move', moveProperties);
                }
            }
        });
    }
};

/**
 * Promote figure
 */
GameScreen.prototype.emit = function (action, data) {
    if (gameScreen.isChromeExtension)
        chrome.runtime.sendMessage({action: action, data: data}, function (response) {
        });
    else if (gameScreen.socket.connected) {
        gameScreen.socket.emit(action, data);
    } else {
        // do nothing
    }
};

/**
 * Promote figure
 */
GameScreen.prototype.promoteFigure = function ($documentRoot, msg) {
    var $promoteModal = $documentRoot.find('#promoteModal');
    $promoteModal.find('form').submit(function (e) {
        e.preventDefault();
        $promoteModal.modal('hide');
    });

    $promoteModal.modal('toggle')
        .on('hidden.bs.modal', function (e) {
            msg.promoteTo = $promoteModal.find('form input[type=radio]:checked').val();
            gameScreen.emit('move', msg);
        });
};

/**
 * End Turn
 */
GameScreen.prototype.endTurn = function (msg) {
    var gameboard = gameScreen.activeScreen.entities['gameboard'];

    // take
    if (msg.entitiesDeleted)
        msg.entitiesDeleted.forEach(function (entity, entityIndex) {
            var destinationY = ((gameboard.flipped) ? (gameboard.boardHeight - 1 - entity.y) : entity.y) * (gameboard.tileHeight + gameboard.tileGap) + gameboard.tileGap;
            var destinationX = ((gameboard.flipped) ? (gameboard.boardWidth - 1 - entity.x) : entity.x) * (gameboard.tileWidth + gameboard.tileGap) + gameboard.tileGap;

            gameboard.tiles.forEach(function (tile, tileIndex) {
                if ((tile.x === destinationX) && (tile.y === destinationY) && (tile.side === entity.side)) {
                    gameboard.tiles.splice(tileIndex, 1);
                }
            });
        });

    // add new pieces
    if (msg.entitiesAdded)
        gameboard.createTiles(msg.entitiesAdded);

    // move piece
    if (msg.entitiesChanged)
        msg.entitiesChanged.forEach(function (entity, entityIndex) {
            var entityY = ((gameboard.flipped) ? (gameboard.boardHeight - 1 - entity.y) : entity.y) * (gameboard.tileHeight + gameboard.tileGap) + gameboard.tileGap;
            var entityX = ((gameboard.flipped) ? (gameboard.boardWidth - 1 - entity.x) : entity.x) * (gameboard.tileWidth + gameboard.tileGap) + gameboard.tileGap;

            gameboard.tiles.forEach(function (tile, tileIndex) {
                if ((tile.x === entityX) && (tile.y === entityY) && (entity.path.length > 0)) {
                    tile.setPath((gameboard.flipped) ? tile.getFlippedPath(entity) : entity.path);
                }
            });
        });

    // switch sides after move
    gameboard.set("sideToMove", (gameboard.sideToMove === 1) ? 0 : 1);
};

/**
 * Start game
 */
GameScreen.prototype.startGame = function ($documentRoot, data) {
    console.log("STARTING GAME...");
    $documentRoot.find('#left-header-text').text('White: ' + data.whitePlayer.nick);
    $documentRoot.find('#right-header-text').text('Black: ' + data.blackPlayer.nick);
    $("#alert-container").empty();

    var gameboard             = gameScreen.activeScreen.entities['gameboard'];
    gameboard.whitePlayerNick = data.whitePlayer.nick;
    gameboard.blackPlayerNick = data.blackPlayer.nick;

    // create gameboard tiles
    gameboard.createTiles(data.entities);

    // clear status box
    gameboard.statusBox.setText("");
    gameboard.set("active", true);
};

/**
 * Set player's side
 */
GameScreen.prototype.setSide = function (player) {
    this.player.set("side", player.side);
    this.player.set("invitationGame", player.invitationGame);
    if (!this.player.invitationID && player.invitationID) {
        this.player.set("invitationID", player.invitationID);

        // show alert with player.invitationID value
        $(".alert.alert-info.hide").clone().appendTo("#alert-container").removeClass('hide').find("strong").text(player.invitationID);
    }

    var gameboard = this.activeScreen.entities['gameboard'];
    gameboard.set("flipped", (player.side === 0));
};

/**
 * Socket extension listener
 */
GameScreen.prototype.socketExtensionListener = function (request, sender, sendResponse) {
    switch (request.action) {
        case 'promote':
            gameScreen.promoteFigure(gameScreen.documentRoot, request.data);
            break;
        case 'turn complete':
            gameScreen.endTurn(request.data);
            break;
        case 'start_game':
            gameScreen.startGame(gameScreen.documentRoot, request.data);
            break;
        case 'side':
            gameScreen.setSide(request.data);
            gameScreen.storePlayer();
            break;
        case 'alert':
            gameScreen.activeScreen.entities.gameboard.statusBox.setText(request.data.text);
            break;
    }

    gameScreen.storeActiveScreen(gameScreen.activeScreen);
};

/**
 * Extension messaging initialization
 */
GameScreen.prototype.initExtensionListener = function () {
    chrome.runtime.onMessage.addListener(this.socketExtensionListener);
};

/**
 * SocketIO initialization
 */
GameScreen.prototype.initSocketIO = function () {
    this.socket = io.connect(boardGameModule.Config.HOST);
    this.socket.on('connect', function () {
        // clear previously buffered data when reconnecting
        this.sendBuffer = [];
    });

    this.socket.on('promote', function (msg) {
        gameScreen.promoteFigure(gameScreen.documentRoot, msg);
    });

    this.socket.on('turn complete', function (msg) {
        gameScreen.endTurn(msg);
    });

    this.socket.on('start_game', function (data) {
        gameScreen.startGame(gameScreen.documentRoot, data);
    });

    this.socket.on('side', function (player) {
        gameScreen.setSide(player)
    });

    this.socket.on('alert', function (data) {
        gameScreen.activeScreen.entities.gameboard.statusBox.setText(data.text);
    });

};


/**
 * Set canvas size
 */
GameScreen.prototype.setCanvasSize = function () {
    this.canvas.setAttribute("width", boardGameModule.Config.WIDTH);
    this.canvas.setAttribute("height", boardGameModule.Config.HEIGHT);
};

/**
 * Enter full screen
 */
GameScreen.prototype.enterFullScreen = function () {
    if (this.canvas.webkitRequestFullScreen)
        this.canvas.webkitRequestFullScreen();
    else
        this.canvas.mozRequestFullScreen();
};

/**
 * Draw game screen
 */
GameScreen.prototype.draw = function () {
    this.activeScreen.draw();
};

/**
 * Add entity to active screen
 */
GameScreen.prototype.addEntity = function (entityID, entity) {
    this.activeScreen.addEntity(entityID, entity);
};

/**
 * Remove entity from active screen
 */
GameScreen.prototype.removeEntity = function (entityID) {
    this.activeScreen.removeEntity(entityID);
};

/**
 * Get entity from active screen by entityID
 */
GameScreen.prototype.getEntityByID = function (entityID) {
    return this.activeScreen.getEntityByID(entityID);
};

/**
 * Checks if active screen has screenID
 */
GameScreen.prototype.activeScreenIs = function (entityID) {
    return this.activeScreen.is(entityID);
};

/**
 * Recreate object from it's state
 */
GameScreen.prototype.objectFromState = function (objectState) {
    var objectPrototype;
    switch (objectState.constructorName) {
        case 'Screen':
            objectPrototype = Screen.prototype;
            break;
        case 'Menu':
            objectPrototype = Menu.prototype;
            break;
        case 'Button':
            objectPrototype = Button.prototype;
            break;
        case 'Player':
            objectPrototype = playerModule.Player.prototype;
            break;

        case 'Gameboard':
            objectPrototype = Gameboard.prototype;
            break;
        case 'StatusBox':
            objectPrototype = StatusBox.prototype;
            break;
        case 'Tile':
            objectPrototype = Tile.prototype;
            break;
        case 'ActiveEntity':
            objectPrototype = ActiveEntity.prototype;
            break;
        case 'Entity':
            objectPrototype = Entity.prototype;
            break;
        default:
            objectPrototype = Object.prototype;
    }

    var freshObject = Object.create(objectPrototype);
    var gs          = this;
    var sr          = this.spriteRepository;
    for (var prop in objectState) {
        if (objectState.hasOwnProperty(prop)) {
            if (utils.isObject(objectState[prop])) {
                freshObject[prop] = gs.objectFromState(objectState[prop]);
                if (utils.isFunction(freshObject[prop].setDrawingContext))
                    freshObject[prop].setDrawingContext(sr);
            }
            else if (utils.isArray(objectState[prop])) {
                freshObject[prop] = [];
                objectState[prop].forEach(function (element, elementIndex) {
                    if (utils.isObject(element)) {
                        var elementObject = gs.objectFromState(element);
                        if (utils.isFunction(elementObject.setDrawingContext))
                            elementObject.setDrawingContext(sr);
                        freshObject[prop].push(elementObject);
                    }
                    else
                        freshObject[prop].push(element);
                });
            }
            else
                freshObject[prop] = objectState[prop];
        }
    }

    return freshObject;
};

/**
 * Load player
 */
GameScreen.prototype.loadPlayer = function (loadFromStorage) {
    var player      = false;
    var objectState = (loadFromStorage)
        ? localStorage.getItem('player')
        : chrome.extension.getBackgroundPage().backgroundProcess.player;
    if (objectState) {
        objectState = JSON.parse(objectState);
        player      = this.objectFromState(objectState);
    }

    return player;
};


/**
 * Store active screen
 */
GameScreen.prototype.storePlayer = function (loadFromStorage) {
    var objectState = JSON.stringify(this.player);

    if (loadFromStorage)
        localStorage.setItem('player', objectState);
    else
        chrome.extension.getBackgroundPage().backgroundProcess.player = objectState;

};

/**
 * Load active screen
 */
GameScreen.prototype.loadActiveScreen = function (loadFromStorage) {
    var activeScreen = {};
    var objectState  = (loadFromStorage)
        ? localStorage.getItem('activeScreen')
        : chrome.extension.getBackgroundPage().backgroundProcess.activeScreen;
    if (objectState) {
        objectState  = JSON.parse(objectState);
        activeScreen = this.objectFromState(objectState);
    }
    else
        activeScreen = this.screenRepository.mainMenuScreen();

    return activeScreen;
};

/**
 * Store active screen
 */
GameScreen.prototype.storeActiveScreen = function (activeScreen, loadFromStorage) {
    var objectState = JSON.stringify(activeScreen, function replacer(key, value) {
        if (key === "canvas" || key === "drawingContext") {
            return;
        }
        return value;
    });

    if (loadFromStorage)
        localStorage.setItem('activeScreen', objectState);
    else
        chrome.extension.getBackgroundPage().backgroundProcess.activeScreen = objectState;
};

/**
 * Sets active screen
 */
GameScreen.prototype.setActiveScreen = function (activeScreen) {
    if (this.isChromeExtension)
        this.storeActiveScreen(activeScreen);

    this.activeScreen = activeScreen;
    this.clearActiveScreen();
};

/**
 * Clears active screen
 */
GameScreen.prototype.clearActiveScreen = function () {
    this.context.clearRect(0, 0, this.canvas.getAttribute("width"), this.canvas.getAttribute("height"));
};

/**
 * Executed queued messages
 */
GameScreen.prototype.executeMessageQueue = function () {
    var messageQueue = chrome.extension.getBackgroundPage().backgroundProcess.messageQueue;
    while (messageQueue.length > 0) {
        this.socketExtensionListener(messageQueue.shift());
    }
};

