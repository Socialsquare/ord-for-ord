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

  socket.on('player:ready', function(ready) {
    if (game.state === game.constructor.states.LOBBY) {
      game.setPlayerReady(player.id, ready);
    }
  });

  socket.on('game:join', function(cb) {
    if (game.state === game.constructor.states.LOBBY) {
      game.addPlayer(player);
      cb(game);
    } else {
      cb(false);
    }
  });

  socket.on('game:start', function(cb) {
    if (game.state === game.constructor.states.LOBBY) {
      var started = game.start(player.id);
      cb(started);
    } else {
      cb(false);
    }
  });

  socket.on('game:startRound', function(firstWord, cb) {
    if (game.state === game.constructor.states.PRE_GAME) {
      var started = game.startRound(player.id, firstWord);
      cb(started);
    } else {
      cb(false);
    }
  });

  socket.on('game:appendWord', function(word, cb) {
    if (game.state === game.constructor.states.PLAYING) {
      game.appendWord(player.id, word);
      cb(game);
    } else {
      cb(false);
    }
  });

  socket.on('disconnect', function() {
    game.removePlayer(player.id);
  });

  socket.on('debug:fakeState', function(cb) {
    // Have three players join the game.
    var me = new Player(socket);
    game.addPlayer(me);
    var player1 = new Player(null);
    game.addPlayer(player1);
    var player2 = new Player(null);
    game.addPlayer(player2);
    // Start the game with this player as the game master.
    game.start(player.id);
    // Start the round with the word, "banan".
    game.startRound(player.id, 'banan');
    // Send back the game state.
    cb(game);
  });
});



