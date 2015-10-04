var uuid = require('uuid'),
    _ = require('lodash'),
    sharedConfig = require('../lib/shared-config'),
    settings = require('../settings.json'),
    titles = require('../indexing/titles').init(settings.elasticsearch, 'dbc-books');

Game.COLOR_COUNT = 4;

Game.MIN_PLAYERS = 2;
Game.MAX_PLAYERS = 4;
Game.states = {
  LOBBY: 'lobby',
  PRE_GAME: 'pre-game',
  PLAYING: 'playing',
  GAME_ENDED: 'game-ended'
};
Game.INITIATE_TIME = 2000;

function Game() {
  this.init();
}

Game.prototype.init = function() {
  this.id = 'ga-' + uuid.v1();
  this.state = Game.states.LOBBY;
  this.playerIds = [];
  this.players = {};
  this.words = [];
  this.currentPlayerIndex = 0;
  clearTimeout(this.endTurnTimeout);
};

Game.prototype.toJSON = function() {
  return {
    id: this.id,
    state: this.state,
    players: _.values(this.players),
    judgeId: this.hasJudge() ? this.playerIds[0] : null,
    currentPlayerId: this.playerIds[this.currentPlayerIndex]
  };
};

Game.prototype.hasJudge = function() {
  return this.playerIds.length > 2 || this.state !== Game.states.PLAYING;
};

Game.prototype.getUnusedColor = function() {
  var colors = _.range(Game.COLOR_COUNT);
  for (var key in this.players) {
    var c = colors.indexOf(this.players[key].color);
    colors.splice(c, 1);
  }
  return _.shuffle(colors)[0];
};

Game.prototype.addPlayer = function(player) {
  if (player.id in this.players === false) {
    if(Object.keys(this.players).length >= Game.MAX_PLAYERS) {
      return false;
    }
    player.color = this.getUnusedColor();
    this.players[player.id] = player;
    this.playerIds.push(player.id);
    if(player.socket) {
      player.socket.join(this.id);
      player.socket.broadcast.to(this.id).emit('player:add', player.toJSON());
    }
  }
  return true;
};

Game.prototype.removePlayer = function(playerId) {
  if (playerId in this.players === true) {
    var player = this.players[playerId];
    delete this.players[playerId];
    this.playerIds = this.playerIds.filter(function(id) {
      return id !== playerId;
    });
    if(player.socket) {
      player.socket.broadcast.to(this.id).emit('player:remove', player.id);
      player.socket.leave(this.id);
    }
    // If everyone has left the game.
    if(this.playerIds.length === 0) {
      // Let's re-initialize the game!
      this.init();
    }
  }
};

Game.prototype.setPlayerReady = function(playerId, ready) {
  if (playerId in this.players === true) {
    var player = this.players[playerId];
    player.setReady(ready);
    player.socket.broadcast.to(this.id).emit('player:update', player.id,
      { ready: ready });
    this.tryToStartGameCountDown();
  }
};

Game.prototype.allPlayersReady = function() {
  for (var key in this.players) {
    if (this.players[key].ready === false) {
      return false;
    }
  }
  return true;
};

Game.prototype.tryToStartGameCountDown = function() {
  if (this.allPlayersReady() === true) {
    console.log('all players ready');
    this.startGameTimeout = setTimeout(() => {

      console.log('start the game');
      this.start();
    }, Game.INITIATE_TIME);
  } else {
    console.log('not ready');
    clearTimeout(this.startGameTimeout);
  }
};

Game.prototype.nextPlayerTurn = function() {
  this.state = Game.states.PLAYING;
  this.currentPlayerIndex++;
  if (this.currentPlayerIndex > this.playerIds.length - 1) {
    this.currentPlayerIndex = this.hasJudge() ? 1 : 0;
  }
  this.broadcastGameUpdate();

  // End turn if the player doesn't end it before the time runs out
  this.endTurnTimeout = setTimeout(
    this.nextPlayerTurn.bind(this), sharedConfig.turnLength);
};

Game.prototype.nextJudge = function() {
  var currentJudge = this.playerIds.shift();
  this.playerIds.push(currentJudge);
};

Game.prototype.isJudge = function(playerId) {
  if(this.playerIds.length > 0) {
    return this.playerIds[0] === playerId;
  }
  return false;
};

Game.prototype.isCurrentPlayer = function(playerId) {
  return this.playerIds[this.currentPlayerIndex] === playerId;
};

Game.prototype.broadcast = function() {
  this.playerIds.forEach((id) => {
    var sock = this.players[id].socket;
    sock.emit.apply(sock, arguments);
  });
};

Game.prototype.broadcastGameUpdate = function() {
  this.broadcast('game:update', this);
};

Game.prototype.start = function() {
  if(Object.keys(this.players).length < Game.MIN_PLAYERS) {
    console.error('Cannot start a game with only',
                  Object.keys(this.players).length,
                  'players');
    return false;
  }
  this.state = Game.states.PRE_GAME;
  this.broadcastGameUpdate();
  return true;
};

Game.prototype.terminate = function(playerId) {
  if(this.state !== Game.states.PLAYING) {
    console.error('The game has to be in playing state to terminate.');
    return false;
  }
  if(!this.isJudge(playerId)) {
    console.error('Only the judge can terminate the game.');
    return false;
  }

  this.state = Game.states.GAME_ENDED;
  this.nextJudge();
  this.broadcastGameUpdate();
  return true;
};

Game.prototype.restart = function(playerId) {
  if(this.state !== Game.states.GAME_ENDED) {
    console.error('The game has to be ended to terminate.');
    return false;
  }
  if(!this.isJudge(playerId)) {
    console.error('Only the judge can restart the game.');
    return false;
  }

  clearTimeout(this.endTurnTimeout);
  this.state = Game.states.PRE_GAME;
  this.words = [];
  this.broadcastGameUpdate();
  return true;
};

Game.prototype.appendWord = function(playerId, word) {
  clearTimeout(this.endTurnTimeout);
  if(!this.isCurrentPlayer(playerId)) {
    console.error('Only the current player can append a word');
    return false;
  }
  if(this.state === Game.states.PRE_GAME && this.currentPlayerIndex !== 0) {
    console.error('In the pre-game state, only the judge appends a word');
    return false;
  }
  if(this.state !== Game.states.PLAYING && this.currentPlayerIndex > 0) {
    console.error('In the playing state, the judge cannot append words');
    return false;
  }

  this.nextPlayerTurn();

  var wordObj = {
    word: word,
    playerId: playerId,
    score: null
  };
  this.words.push(wordObj);
  this.broadcast('word:append', wordObj);

  if(this.words.length >= 2) {
    var lastWords = this.words.slice(-2).map(function(w) {
      return w.word;
    });
    titles.evaluateWordScore(lastWords).then(function(score) {
      console.log('score is in:', score);
      wordObj.score = score;
    });
  }
};

module.exports = new Game();
