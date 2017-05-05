/**
 * Extension Background class
 */
function ExtensionBackground() {
    // Message queue
    this.messageQueue = [];

    // Socket
    this.initSocketActions();
}

/**
 * SocketIO initialization
 */
ExtensionBackground.prototype.initSocketIO = function (request) {
    this.socket = io.connect(boardGameModule.Config.HOST);
    this.socket.on('connect', function () {
        // clear previously buffered data when reconnecting
        this.sendBuffer = [];

        backgroundProcess.processActions(request);
    });

    var actions = ['promote', 'turn complete', 'start_game', 'side', 'alert'];
    for (var i = 0; i < actions.length; i++) {
        this.socket.on(actions[i], this.backgroundActionListener);
    }
};

/**
 * SocketIO initialization
 */
ExtensionBackground.prototype.initSocketActions = function () {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            // console.log(sender.tab ?
            //    "from a content script:" + sender.tab.url :
            //    "from the extension");
            if (!((typeof backgroundProcess.socket !== 'undefined') && backgroundProcess.socket.connected)) {
                backgroundProcess.initSocketIO(request);
                return;
            }

            backgroundProcess.processActions(request);
        });
};

ExtensionBackground.prototype.processActions = function (request) {
    var actions = ['move', 'ready_for_game', 'invitation_game'];
    if (actions.indexOf(request.action) !== -1) {
        backgroundProcess.socket.emit(request.action, request.data);
    }
};

ExtensionBackground.prototype.backgroundActionListener = function (data, meta) {
    var message   = {action: meta.action, data: data};
    var popupOpen = chrome.extension.getViews({type: "popup"}).length;
    if (popupOpen)
        chrome.runtime.sendMessage(message, function (response) {
        });
    else {
        backgroundProcess.messageQueue.push(message);
        chrome.browserAction.setBadgeText({text: "1"});
    }
};

var backgroundProcess = new ExtensionBackground();
