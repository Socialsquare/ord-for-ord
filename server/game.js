var uuid = require('uuid'),
    _ = require('lodash');

Game.colors = [
  'green', 'red', 'blue', 'teal', 'purple', 
  'brown', 'green', 'yellow', 'orange'
];

Game.MAX_PLAYERS = 4;
Game.states = {
  LOBBY: 'lobby'
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
    gameMaster: this.gameMaster,
    players: _.values(this.players)
  };
};

Game.prototype.addPlayer = function(player) {
  if (player.id in this.players === false) {
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

module.exports = new Game();
