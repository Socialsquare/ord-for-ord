var uuid = require('uuid'),
    _ = require('lodash');

Game.COLOR_COUNT = 4;

Game.MIN_PLAYERS = 2;
Game.MAX_PLAYERS = 4;
Game.states = {
  LOBBY: 'lobby',
  PRE_GAME: 'pre-game',
  PLAYING: 'playing',
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
};

Game.prototype.toJSON = function() {
  return {
    id: this.id,
    state: this.state,
    players: _.values(this.players),
    gameMasterId: this.playerIds.length > 0 ? this.playerIds[0] : null,
    currentPlayerId: this.currentPlayerId
  };
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

Game.prototype.nextGameMaster = function() {
  var currentGameMaster = this.playerIds.shift();
  this.playerIds.push(currentGameMaster);
};

Game.prototype.isGameMaster = function(playerId) {
  if(this.playerIds.length === 0) {
    return false;
  } else {
    return this.playerIds[0] === playerId;
  }
};

Game.prototype.broadcastGameUpdate = function() {
  this.playerIds.forEach((id) => {
    this.players[id].socket.emit('game:update', this);
  });
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

Game.prototype.startRound = function(playerId, firstWord) {
  if(this.isGameMaster(playerId)) {
    console.error('Only game masters can start a round!');
    return false;
  }
  // Choose a random player that is not the Game Master.
  var availablePlayerCount = this.playerIds.length - 1;
  this.currentPlayerIndex = 1+Math.floor(availablePlayerCount * Math.random());
  // Turn the game state into playing.
  this.state = Game.states.PLAYING;
  // Alles gut!
  return true;
};

Game.prototype.appendWord = function(playerId, word) {
};

module.exports = new Game();
