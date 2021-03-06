var express = require('express');
var minify  = require('express-minify');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var crypto  = require('crypto');

var utils  = require('./public/js/inheritance_lib.js');
var entity = require('./protected/entity.js');

var pawn   = require('./protected/pawn.js');
var rook   = require('./protected/rook.js');
var knight = require('./protected/knight.js');
var queen  = require('./protected/queen.js');
var king   = require('./protected/king.js');
var bishop = require('./protected/bishop.js');

var boardGameModule = require('./public/js/config.js');
var Direction       = boardGameModule.getDirection();
var playerModule    = require('./public/js/player.js');

var openGameRooms    = [];
var invitedGameRooms = [];
var activeGameRooms  = []; // room_name: {entities:[], entitiesAdded:[], entitiesChanged:[], entitiesDeleted:[], whitePlayer: {}, blackPlayer: {}}

app.use(minify({cache: __dirname + '/cache'}));
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

/**
 *
 */
var createEntities = function () {
    // create entities
    var entities = [];
    for (var j = 0; j < 2; j++) {
        // pawn
        for (var i = 0; i < 8; i++)
            entities.push(new pawn.Pawn(i, j * 5 + 1, 1, 1, j));

        // rook
        entities.push(new rook.Rook(0, j * 7, 1, 1, j));
        entities.push(new rook.Rook(7, j * 7, 1, 1, j));

        // bishop
        entities.push(new bishop.Bishop(2, j * 7, 1, 1, j));
        entities.push(new bishop.Bishop(5, j * 7, 1, 1, j));

        // queen and king
        entities.push(new queen.Queen(3, j * 7, 1, 1, j));
        entities.push(new king.King(4, j * 7, 1, 1, j));
    }

    // separate knight to be on top while moving over others
    for (j = 0; j < 2; j++) {
        // knight
        entities.push(new knight.Knight(1, j * 7, 1, 1, j));
        entities.push(new knight.Knight(6, j * 7, 1, 1, j));
    }

    return entities;
};

/**
 * Leave player rooms helper
 */
var leavePlayerRooms = function (player, socket, alert) {
    if (player) {
        // delete openGameRooms of disconnected user
        openGameRooms.forEach(function (openGameRoom, openGameRoomIndex) {
            if (openGameRoom.activeGameRoom === player.activeGameRoom)
                openGameRooms.splice(openGameRoomIndex, 1);
        });

        // delete invitedGameRooms of disconnected user
        invitedGameRooms.forEach(function (invitedGameRoom, invitedGameRoomIndex) {
            if (invitedGameRoom.activeGameRoom === player.activeGameRoom)
                invitedGameRooms.splice(invitedGameRoomIndex, 1);
        });

        var roomsToLeave = io.sockets.adapter.sids[player.socketId];
        if (roomsToLeave) {
            if (alert) {
                // notify other player
                io.to(player.socketId).emit('alert', {"text": alert}, {"action": 'alert'});
            }

            for (var room in roomsToLeave) {
                if (roomsToLeave.hasOwnProperty(room) && room.indexOf('::') >= 0) {
                    io.sockets.sockets[player.socketId].leave(room);
                }
            }
        }
    }
};

io.on('connection', function (socket) {
    var whitelisted = [];
    var blacklisted = [];
    if ((whitelisted.indexOf(socket.handshake.address) < 0)
        && (
            blacklisted.indexOf(socket.handshake.address) >= 0
            || Object.keys(io.sockets.sockets).length > boardGameModule.Config.CONNECTIONS_LIMIT
        )) {

        socket.disconnect(true);
        return;
    }

    // player object
    var activePlayer = new playerModule.Player();
    activePlayer.set("socketId", socket.id);
    activePlayer.set("activeGameRoom", false);
    activePlayer.set("clientIp", socket.handshake.address);
    console.log('a user connected from address: ' + activePlayer.clientIp);

    // move event
    socket.on('move', function (msg) {
        if (activePlayer.activeGameRoom === false
            || (typeof activeGameRooms[activePlayer.activeGameRoom] === 'undefined'))
            return;

        var boardY = (msg.tileToMove.y - msg.tileToMove.gap) / (msg.tileToMove.height + msg.tileToMove.gap);
        var boardX = (msg.tileToMove.x - msg.tileToMove.gap) / (msg.tileToMove.width + msg.tileToMove.gap);

        var entityToMove = null;
        activeGameRooms[activePlayer.activeGameRoom].entities.forEach(function (entity, index) {
            if ((entity.x === boardX)
                && (entity.y === boardY)
                && (entity.clazz === msg.tileToMove.clazz) && (entity.side === activePlayer.side)) {

                entityToMove = entity;
                if (msg.promoteTo)
                    entityToMove.promote = msg.promoteTo;
            }
        });
        if (entityToMove === null)
            return;

        // board coordinates destination
        boardY = Math.floor((msg.mousePos.y - msg.tileToMove.gap) / (msg.tileToMove.height + msg.tileToMove.gap));
        boardX = Math.floor((msg.mousePos.x - msg.tileToMove.gap) / (msg.tileToMove.width + msg.tileToMove.gap));

        // destination
        var destinationY = boardY * (msg.tileToMove.height + msg.tileToMove.gap) + msg.tileToMove.gap;
        var destinationX = boardX * (msg.tileToMove.width + msg.tileToMove.gap) + msg.tileToMove.gap;

        // move
        var offsetY = (destinationY - msg.tileToMove.y) / (msg.tileToMove.height + msg.tileToMove.gap);
        var offsetX = (destinationX - msg.tileToMove.x) / (msg.tileToMove.width + msg.tileToMove.gap);
        var path    = [];

        while ((offsetX !== 0) && (offsetY !== 0)) {
            var direction = false;
            if ((offsetX > 0) && (offsetY > 0)) {
                direction = Direction.DOWNRIGHT;
            }
            if ((offsetX < 0) && (offsetY > 0)) {
                direction = Direction.DOWNLEFT;
            }
            if ((offsetX > 0) && (offsetY < 0)) {
                direction = Direction.UPRIGHT;
            }
            if ((offsetX < 0) && (offsetY < 0)) {
                direction = Direction.UPLEFT;
            }

            if (direction) {
                path.push(direction);
                offsetX -= Direction.getdx(direction);
                offsetY -= Direction.getdy(direction);
            }
            else
                break;
        }

        if (Math.abs(offsetX) > 0)
            for (var i = 0; i < Math.abs(offsetX); i++)
                path.push((offsetX > 0) ? Direction.RIGHT : Direction.LEFT);

        if (Math.abs(offsetY) > 0)
            for (var j = 0; j < Math.abs(offsetY); j++)
                path.push((offsetY > 0) ? Direction.DOWN : Direction.UP);

        // check that destination is valid move regarding rules
        var validMove = entityToMove.checkMove(activeGameRooms[activePlayer.activeGameRoom].entities, path,
            activeGameRooms[activePlayer.activeGameRoom].entitiesChanged);

        // if marked to be promoted, send user message to show dialog to choose figure
        if (entityToMove.promote === true) {
            io.to(activePlayer.socketId).emit('promote', msg, {"action": 'promote'});
            return;
        }

        if (validMove === false)
            return;

        // take opponent piece
        activeGameRooms[activePlayer.activeGameRoom].entities.forEach(function (entity, index) {
            if (entity.enpassaned) {
                // delete entity if taken by enpassan
                activeGameRooms[activePlayer.activeGameRoom].entitiesDeleted.push(entity);
                delete activeGameRooms[activePlayer.activeGameRoom].entities[index];
            } else // disable enpassan on next opponent move if not taken above
            if (entity.enpassan && (entity.side !== entityToMove.side))
                entity.set("enpassan", false);

            if ((entity.x === boardX) && (entity.y === boardY) && (entity.side !== entityToMove.side)) {
                activeGameRooms[activePlayer.activeGameRoom].entitiesDeleted.push(entity);
                delete activeGameRooms[activePlayer.activeGameRoom].entities[index];
            }

            // if player has chosen figure to promote pawn,
            // delete pawn and add new figure
            if (entity.promote) {
                activeGameRooms[activePlayer.activeGameRoom].entitiesDeleted.push(entity);
                delete activeGameRooms[activePlayer.activeGameRoom].entities[index];

                // create new promoted entity to move
                switch (entity.promote) {
                    case 'rook':
                        entityToMove = new rook.Rook(entityToMove.x, entityToMove.y, 1, 1, entityToMove.side);
                        break;
                    case 'bishop':
                        entityToMove = new bishop.Bishop(entityToMove.x, entityToMove.y, 1, 1, entityToMove.side);
                        break;
                    case 'knight':
                        entityToMove = new knight.Knight(entityToMove.x, entityToMove.y, 1, 1, entityToMove.side);
                        break;
                    case 'queen':
                    default:
                        entityToMove = new queen.Queen(entityToMove.x, entityToMove.y, 1, 1, entityToMove.side);
                }

                activeGameRooms[activePlayer.activeGameRoom].entitiesAdded.push(entityToMove);
            }
        });

        // set path
        entityToMove.set("path", path);
        activeGameRooms[activePlayer.activeGameRoom].entitiesChanged.push(entityToMove);

        // end turn
        // TODO: improve differential mechanism of sending data to client side
        // to include only properties that have been changed
        io.to(activePlayer.activeGameRoom).emit('turn complete',
            {
                "entitiesAdded":   activeGameRooms[activePlayer.activeGameRoom].entitiesAdded,
                "entitiesChanged": activeGameRooms[activePlayer.activeGameRoom].entitiesChanged,
                "entitiesDeleted": activeGameRooms[activePlayer.activeGameRoom].entitiesDeleted
            }, {"action": 'turn complete'});

        activeGameRooms[activePlayer.activeGameRoom].entitiesChanged.forEach(function (entity, entityIndex) {
            // clean path and set position
            var path   = entity.path;
            var boardX = entity.x;
            var boardY = entity.y;
            path.forEach(function (direction, directionIndex) {
                boardX += Direction.getdx(direction);
                boardY += Direction.getdy(direction);
            });

            // set position and clean path
            entity.setPosition(boardX, boardY);
            entity.set("path", []);
        });

        // add new entities
        activeGameRooms[activePlayer.activeGameRoom].entitiesAdded.forEach(function (entity, entityIndex) {
            activeGameRooms[activePlayer.activeGameRoom].entities.push(entity);
        });

        // clean changed and deleted on turn complete
        activeGameRooms[activePlayer.activeGameRoom].entitiesAdded   = [];
        activeGameRooms[activePlayer.activeGameRoom].entitiesChanged = [];
        activeGameRooms[activePlayer.activeGameRoom].entitiesDeleted = [];
    });

    // ready for game event
    socket.on('ready_for_game', function (player) {
        // set nick from client object
        activePlayer.nick = player.nick;

        leavePlayerRooms(activePlayer, socket);
        leavePlayerRooms(activePlayer.opponent(activeGameRooms), socket, 'Opponent resigned. You won!');
        delete activeGameRooms[activePlayer.activeGameRoom];

        // check if there is open games
        if (openGameRooms.length === 0) {
            var timestamp               = new Date().getTime();
            activePlayer.activeGameRoom = activePlayer.socketId + '::' + timestamp;
            // create new room
            socket.join(activePlayer.activeGameRoom);

            // set as white
            activePlayer.side = 1;

            // set invitation game
            activePlayer.invitationGame = false;
            activePlayer.invitationID   = false;

            openGameRooms.push(activePlayer); //{"room": activePlayer.activeGameRoom, "whitePlayer": player}
            io.to(activePlayer.socketId).emit('side', activePlayer, {"action": 'side'});
        } else {
            // use existing
            var openGameRoom            = openGameRooms.pop();
            activePlayer.activeGameRoom = openGameRoom.activeGameRoom;
            socket.join(activePlayer.activeGameRoom);

            // set player side as black
            activePlayer.side = 0;

            // set invitation game
            activePlayer.invitationGame = false;
            activePlayer.invitationID   = false;

            io.to(activePlayer.socketId).emit('side', activePlayer, {"action": 'side'});

            // create entities
            var entities = createEntities();

            // assign active room
            activeGameRooms[activePlayer.activeGameRoom] = {
                'entities':        entities,
                'entitiesAdded':   [],
                'entitiesChanged': [],
                'entitiesDeleted': [],
                "whitePlayer":     openGameRoom,
                "blackPlayer":     activePlayer
            };
            // start game
            io.to(activePlayer.activeGameRoom).emit('start_game', {
                "entities":    entities,
                "whitePlayer": openGameRoom,
                "blackPlayer": activePlayer
                // "roomId": activePlayer.activeGameRoom,
            }, {"action": 'start_game'});
        }
    });

    // game invitation
    socket.on('invitation_game', function (player) {
        // set nick from client object
        activePlayer.nick = player.nick;

        leavePlayerRooms(activePlayer, socket);
        leavePlayerRooms(activePlayer.opponent(activeGameRooms), socket, 'Opponent resigned. You won!');
        delete activeGameRooms[activePlayer.activeGameRoom];

        // check if player has invitationID set
        if (player.invitationID === false) {
            var timestamp               = new Date().getTime();
            activePlayer.activeGameRoom = activePlayer.socketId + '::' + timestamp;
            // create new room
            socket.join(activePlayer.activeGameRoom);

            // set as white
            activePlayer.side = 1;

            // set invitation game
            activePlayer.invitationGame = player.invitationGame;
            // make hash value
            activePlayer.invitationID   = crypto.createHash('md5').update(activePlayer.socketId + '::' + timestamp).digest('hex');

            invitedGameRooms.push(activePlayer);
            io.to(activePlayer.socketId).emit('side', activePlayer, {"action": 'side'});
        }
        else {
            var whitePlayer = null;
            invitedGameRooms.forEach(function (invitedGameRoom, invitedGameRoomIndex) {
                if (invitedGameRoom.invitationID === player.invitationID) {
                    whitePlayer = invitedGameRoom;
                    invitedGameRooms.splice(invitedGameRoomIndex, 1);
                }
            });

            if (whitePlayer === null) {
                io.to(activePlayer.socketId).emit('alert', {"text": "Invitation ID not valid! Try again..."}, {"action": 'alert'});
                return false;
            }

            activePlayer.activeGameRoom = whitePlayer.activeGameRoom;
            socket.join(activePlayer.activeGameRoom);

            // set player side
            activePlayer.side = 0;

            // set invitation game
            activePlayer.invitationGame = player.invitationGame;
            activePlayer.invitationID   = player.invitationID;

            io.to(activePlayer.socketId).emit('side', activePlayer, {"action": 'side'});

            // create entities
            var entities = createEntities();

            // assign active room
            activeGameRooms[activePlayer.activeGameRoom] = {
                'entities':        entities,
                'entitiesAdded':   [],
                'entitiesChanged': [],
                'entitiesDeleted': [],
                'whitePlayer':     whitePlayer,
                'blackPlayer':     activePlayer
            };

            // start game
            io.to(activePlayer.activeGameRoom).emit('start_game',
                {
                    'entities':    entities,
                    'whitePlayer': whitePlayer,
                    'blackPlayer': activePlayer
                }, {"action": 'start_game'});
        }
    });

    // disconnect event
    socket.on('disconnect', function () {
        // close activeGameRoom
        leavePlayerRooms(activePlayer, socket);
        leavePlayerRooms(activePlayer.opponent(activeGameRooms), socket, 'Opponent resigned. You won!');

        delete activeGameRooms[activePlayer.activeGameRoom];
    });
});
