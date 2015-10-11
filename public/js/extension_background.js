/**
 * Extension Background class
 */
function ExtensionBackground()
{
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
		chrome.runtime.sendMessage({action:'promote', data:msg},function(response){});
	});

	this.socket.on('turn complete', function(msg) {
		chrome.runtime.sendMessage({action:'turn complete', data:msg},function(response){});
	});

	this.socket.on('start_game', function(data) {
		chrome.runtime.sendMessage({action:'start_game', data:data},function(response){});
	});

	this.socket.on('side', function(player) {
		chrome.runtime.sendMessage({action:'side', data:player},function(response){});
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