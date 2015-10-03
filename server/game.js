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
    player.color = this.getUnusedColor();
    this.players[player.id] = player;
    player.socket.join(this.id);
    player.socket.broadcast.to(this.id).emit('player:add', player.toJSON());
  }
};

Game.prototype.removePlayer = function(playerId) {
  if (playerId in this.players === true) {
    var player = this.players[playerId];
    delete this.players[playerId];
    player.socket.broadcast.to(this.id).emit('player:remove', player.id);
    player.socket.leave(this.id);
  }
};

Game.prototype.getPlayerIds = function(includeGameMaster) {
  var players = this.players;
  if(!includeGameMaster) {
    // Filter out the game master
    players = players.filter(function(p) {
      return p.id !== this.gameMasterId;
    });
  }
  // Transform to ids
  return players.map(function(p) {
    return p.id;
  });
};

Game.prototype.start = function(playerId, firstWord) {
  if(playerId !== this.gameMasterId) {
    throw new Error('Only the game master can start the game');
  }
  this.state = Game.states.PLAYING;
  var players = this.getPlayerIds();
  // this.turn; // Pick one at random ...
  console.log(players);
};

Game.prototype.appendWord = function(playerId, word) {
};

module.exports = new Game();
