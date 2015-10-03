var express     = require('express'),
    fs          = require('fs'),
    bodyParser  = require('body-parser'),
    http        = require('http'),
    path        = require('path');
    app         = module.exports = express();

var httpServer = http.Server(app),
    io         = require('socket.io').listen(httpServer);

app.set('port', process.env.PORT || 3000);
app.set('name', 'In Other Words');
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Start server
httpServer.listen(app.get('port'), () => {
  console.log("HTTP listening on port " + app.get('port'));
  app.get('*', function(req, res) {
    return res.sendFile(__dirname + '/public/index.html');
  });
});

var Player = require('./server/player'),
    game = require('./server/game');
var sockets = io.on('connection', function(socket) {
  var player = new Player(socket);

  socket.emit('player:me', player);

  socket.on('game:join', function(cb) {
    if (game.state === game.constructor.states.LOBBY) {
      game.addPlayer(player);
      cb(game);
    }
  });


  socket.on('disconnect', function() {
    game.removePlayer(player.id);
  });
});



