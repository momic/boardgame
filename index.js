var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var boardGameModule = require('./public/js/config.js');
var Direction = boardGameModule.getDirection();

var onlineUsers = [];
var openGameRooms = [];

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
  console.log(socketId);

  var activeGameRoom = false;

  onlineUsers[socketId] = socket;

  socket.on('chat message', function(msg){
    console.log('message: ' + JSON.stringify(msg));
    if (activeGameRoom == false)
      return;

    boardY = Math.floor((msg.mousePos.y - msg.tileToMove.gap) / (msg.tileToMove.height + msg.tileToMove.gap));
    boardX = Math.floor((msg.mousePos.x - msg.tileToMove.gap) / (msg.tileToMove.width  + msg.tileToMove.gap));  

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

    io.to(activeGameRoom).emit('chat message', {"tileToMove":msg.tileToMove, "destinationY":destinationY, "destinationX":destinationX, "path":path});
  });

  socket.on('ready_for_game', function(msg) {
    var gameRoom = null;
    console.log(openGameRooms);
    if (openGameRooms.length == 0) {
      var timestamp = new Date().getTime();
      gameRoom = socketId + '::' + timestamp;
      console.log("Creating new: ");
      socket.join(gameRoom);
      openGameRooms.push(gameRoom);
      io.to(socketId).emit('side', 1);
    } else {
      console.log("Using existing: ");
      gameRoom = openGameRooms.pop()
      socket.join(gameRoom);
      console.log(openGameRooms);
      io.to(socketId).emit('side', 0);
      io.to(gameRoom).emit('start_game', {"roomId": gameRoom});
    }
    activeGameRoom = gameRoom;
    console.log(gameRoom);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    console.log(socketId);
    delete onlineUsers[socketId];

    // TODO: delete openGameRooms of disconected user
  });
});
