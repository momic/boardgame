/**
 * Extension Background class
 */
function ExtensionBackground()
{
	// Message queue
	this.messageQueue = [];

	// Socket
	this.initSocketIO();
}

/**
 * SocketIO initialization
 */
ExtensionBackground.prototype.initSocketIO = function()
{
	this.socket = io.connect(boardGameModule.Config.HOST);

	this.socket.on('promote', function(msg) {
		var popupOpen = chrome.extension.getViews({ type: "popup" }).length;
		if (popupOpen)
			chrome.runtime.sendMessage({action:'promote', data:msg},function(response){});
		else {
			backgroundProcess.messageQueue.push({action:'promote', data:msg});
			chrome.browserAction.setBadgeText({ text: "1" });
		}
	});

	this.socket.on('turn complete', function(msg) {
		var popupOpen = chrome.extension.getViews({ type: "popup" }).length;
		if (popupOpen)
			chrome.runtime.sendMessage({action:'turn complete', data:msg},function(response){});
		else {
			backgroundProcess.messageQueue.push({action:'turn complete', data:msg});
			chrome.browserAction.setBadgeText({ text: "1" });
		}
	});

	this.socket.on('start_game', function(data) {
		var popupOpen = chrome.extension.getViews({ type: "popup" }).length;
		if (popupOpen)
			chrome.runtime.sendMessage({action:'start_game', data:data},function(response){});
		else {
			backgroundProcess.messageQueue.push({action:'start_game', data:data});
			chrome.browserAction.setBadgeText({ text: "1" });
		}
	});

	this.socket.on('side', function(player) {
		var popupOpen = chrome.extension.getViews({ type: "popup" }).length;
		if (popupOpen)
			chrome.runtime.sendMessage({action:'side', data:player},function(response){});
		else {
			backgroundProcess.messageQueue.push({action:'side', data:player});
			chrome.browserAction.setBadgeText({ text: "1" });
		}
	});

	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	    console.log(sender.tab ?
	                "from a content script:" + sender.tab.url :
	                "from the extension");
	    switch (request.action) {
	    	case 'move':
	    		backgroundProcess.socket.emit('move', request.data);
	    		break;
	    	case 'ready_for_game':
	    		backgroundProcess.socket.emit('ready_for_game', request.data);
	    		break;
	    }	    
	  });
}

var backgroundProcess = new ExtensionBackground();