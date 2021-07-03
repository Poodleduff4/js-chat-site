const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
let port = process.env.PORT;
if (port == null || port == "") {
  port = 25576;
}

var users = []
var oldUsername = "";

class User {
  constructor(socket) {
    this.username = "";
    this.socket = socket;
    this.sent_messages = [];
    this.alreadyConnected = false;
  }
}

app.get('/', (req, res) => {
    res.sendFile("./login.html", {root: __dirname});
  });
  
  // app.listen(port);
app.use(express.static("./"));
  
  // app.get('/login', (req, res) => {
    //       res.sendFile(__dirname + "./login.html");
    //     });
    
io.on('connection', function (socket) {
  var userSocket = new User(socket);
  userSocket.username = oldUsername;
  oldUsername = "";
  users.push(userSocket);
  
  var address = userSocket.socket.handshake.address;
  if (address.substr(address.length - 3, 2) == "::") {
    address = "127.0.0." + address[address.length - 1];
    address = "localhost";
  }
  address = address.split(':');
  address = address[address.length - 1];
  if(userSocket.username != ""){
  console.log(userSocket.username + " has connected, Say Hi!");
  io.emit('message', userSocket.username + " has connected, Say Hi!");
  }
  
  socket.on('message', function (message) {
    console.log(userSocket.username + " : " + message);
    io.emit('message', userSocket.username + " : " + message);
    if(message == '!users'){
      for (let index = 0; index < users.length; index++) {
        const element = users[index];
        console.log(element.username);
        io.emit('message', element.username);
      }
      
    }
    
  });
  socket.on('loginRequest', function (username) {
    console.log(username);
    userSocket.username = username;
    oldUsername = username;
    
  })

  socket.on('disconnect', function () {
    if(userSocket.username != ""){
    console.log(userSocket.username + " has disconnected");
    io.emit('message', userSocket.username + " has disconneted");

    }
  });
  
});

http.listen(port, () => {
  console.log('listening on http://localhost:' + port);
});