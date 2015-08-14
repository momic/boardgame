var express = require('express');
var minify = require('express-minify');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var utils = require('./public/js/inheritance_lib.js');
var entity = require('./protected/entity.js');

var pawn = require('./protected/pawn.js');
var rook = require('./protected/rook.js');
var knight = require('./protected/knight.js');
var queen = require('./protected/queen.js');
var king = require('./protected/king.js');
var bishop = require('./protected/bishop.js');

var boardGameModule = require('./public/js/config.js');
var Direction = boardGameModule.getDirection();

var onlineUsers = [];
var openGameRooms = [];
var activeGameRooms = []; // room_name: {entities:[], entitiesChanged:[], entitiesDeleted:[]}

app.use(minify({cache: __dirname + '/cache'}));
app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  var socketId = socket.id
  var clientIp = socket.handshake.address;
  console.log('a user connected from adress: ' + clientIp);

  var activeGameRoom = false;
  var playerSide = false;

  onlineUsers[socketId] = socket;

  socket.on('move', function(msg){
    if (activeGameRoom === false)
      return;

    var boardY = (msg.tileToMove.y - msg.tileToMove.gap) / (msg.tileToMove.height + msg.tileToMove.gap);
    var boardX = (msg.tileToMove.x - msg.tileToMove.gap) / (msg.tileToMove.width  + msg.tileToMove.gap);

    var entityToMove = false;
    activeGameRooms[activeGameRoom].entities.forEach(function(entity, index) {
      if ((entity.x == boardX) && (entity.y == boardY) 
            && (entity.clazz == msg.tileToMove.clazz) && (entity.side === playerSide)) {
        entityToMove = entity;
      }
    });
    if (entityToMove === false)
      return;

    // board coordinates destination
    var boardY = Math.floor((msg.mousePos.y - msg.tileToMove.gap) / (msg.tileToMove.height + msg.tileToMove.gap));
    var boardX = Math.floor((msg.mousePos.x - msg.tileToMove.gap) / (msg.tileToMove.width  + msg.tileToMove.gap));

    // destination
    destinationY = boardY * (msg.tileToMove.height + msg.tileToMove.gap) + msg.tileToMove.gap;
    destinationX = boardX * (msg.tileToMove.width  + msg.tileToMove.gap) + msg.tileToMove.gap;

    // move
    var offsetY = (destinationY - msg.tileToMove.y) / (msg.tileToMove.height + msg.tileToMove.gap);
    var offsetX = (destinationX - msg.tileToMove.x) / (msg.tileToMove.width + msg.tileToMove.gap);
    var path = [];

    while ((offsetX != 0) && (offsetY != 0)) {
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
      for(i=0; i<Math.abs(offsetX); i++)
        path.push((offsetX > 0) ? Direction.RIGHT : Direction.LEFT);

    if (Math.abs(offsetY) > 0)  
      for(j=0; j<Math.abs(offsetY); j++)
        path.push((offsetY > 0) ? Direction.DOWN : Direction.UP);

    // TODO: check that destination is valid move regarding rules
    // var validMove = entityToMove.checkMove(activeGameRooms[activeGameRoom].entities, path);
    // if (validMove === false)
    //   return;

    // take oponent piece
    activeGameRooms[activeGameRoom].entities.forEach(function(entity, index) {

      if ((entity.x == boardX) && (entity.y == boardY) && (entity.side != playerSide)) { 
        activeGameRooms[activeGameRoom].entitiesDeleted.push(entity);
        delete activeGameRooms[activeGameRoom].entities[index];
      }

    });    

    // set path
    entityToMove.set("path", path);
    activeGameRooms[activeGameRoom].entitiesChanged.push(entityToMove);

    // end turn
    // TODO: improve diferential mechanism of sending data to client side 
    // to include only properties that have been changed
    io.to(activeGameRoom).emit('turn complete', 
      {"entitiesChanged": activeGameRooms[activeGameRoom].entitiesChanged, 
       "entitiesDeleted": activeGameRooms[activeGameRoom].entitiesDeleted});

    // clean changed and deleted on turn complete
    activeGameRooms[activeGameRoom].entitiesChanged = [];
    activeGameRooms[activeGameRoom].entitiesDeleted = [];

    // clean path
    entityToMove.set("path", []);

    // set position
    entityToMove.setPosition(boardX, boardY);    
  });

  socket.on('ready_for_game', function(msg) {
    // create entities
    var entities = [];
    for(j=0; j<2; j++) {
      // pawn
      for(i=0; i<8; i++)
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

      // knight
      entities.push(new knight.Knight(1, j * 7, 1, 1, j));
      entities.push(new knight.Knight(6, j * 7, 1, 1, j));
    }

    // check if there is open games
    if (openGameRooms.length == 0) {
      var timestamp = new Date().getTime();
      activeGameRoom = socketId + '::' + timestamp;
      // create new room
      socket.join(activeGameRoom);
      openGameRooms.push(activeGameRoom);

      playerSide = 1;
      io.to(socketId).emit('side', playerSide);
    } else {
      // use existing
      activeGameRoom = openGameRooms.pop()
      socket.join(activeGameRoom);
      // set player side
      playerSide = 0;
      io.to(socketId).emit('side', playerSide);

      // start game
      io.to(activeGameRoom).emit('start_game', {"roomId": activeGameRoom, "entities": entities});
    }

    // assign active room
    activeGameRooms[activeGameRoom] = {'entities': entities, 'entitiesChanged': [], 'entitiesDeleted': []};
  });

  socket.on('disconnect', function() {
    delete onlineUsers[socketId];
    // TODO: delete openGameRooms of disconected user
    // TODO: preserve activeGameRooms of disconected user for a while, give option to return to game
  });
});