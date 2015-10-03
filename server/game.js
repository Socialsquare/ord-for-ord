var uuid = require('uuid'),
    _ = require('lodash');

Game.colors = [
  'green', 'red', 'blue', 'teal', 'purple',
  'brown', 'green', 'yellow', 'orange'
];

Game.MIN_PLAYERS = 2;
Game.MAX_PLAYERS = 4;
Game.states = {
  LOBBY: 'lobby',
  PRE_GAME: 'pre-game',
  PLAYING: 'playing',
};

function Game() {
  this.id = 'ga-' + uuid.v1();
  this.state = Game.states.LOBBY;
  this.gameMaster = null;
  this.players = {};
}

Game.prototype.toJSON = function() {
  return {
    id: this.id,
    state: this.state,
    gameMasterId: this.gameMasterId,
    players: _.values(this.players),
    currentPlayerId: this.currentPlayerId
  };
};

Game.prototype.addPlayer = function(player) {
  if (player.id in this.players === false) {
    if(Object.keys(this.players).length >= Game.MAX_PLAYERS) {
      return false;
    }
    this.players[player.id] = player;
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
    if(player.socket) {
      player.socket.broadcast.to(this.id).emit('player:remove', player.id);
      player.socket.leave(this.id);
    }
  }
};

Game.prototype.getPlayerIds = function(includeGameMaster) {
  var playerIds = Object.keys(this.players);
  if(!includeGameMaster) {
    // Filter out the game master
    playerIds = playerIds.filter(function(p) {
      return p !== this.gameMasterId;
    });
  }
  return playerIds;
};

Game.prototype.start = function(gameMasterId) {
  if(Object.keys(this.players).length < Game.MIN_PLAYERS) {
    console.error('Cannot start a game with only',
                  Object.keys(this.players).length,
                  'players');
    return false;
  }
  this.state = Game.states.PRE_GAME;
  this.gameMasterId = gameMasterId;
  return true;
};

Game.prototype.startRound = function(playerId, firstWord) {
  if(playerId !== this.gameMasterId) {
    console.error('Only game masters can start a round!');
    return false;
  }

  var playersIds = this.getPlayerIds();
  var currentPlayerIndex = Math.floor(playersIds.length * Math.random());
  this.currentPlayerId = playersIds[currentPlayerIndex];

  this.state = Game.states.PLAYING;
  return true;
};

Game.prototype.appendWord = function(playerId, word) {
};

module.exports = new Game();
