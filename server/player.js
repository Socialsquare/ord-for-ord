var uuid = require('uuid');

function Player(socket) {
  this.id = 'pl-' + uuid.v1();
  this.socket = socket;
  this.color = '';
}

Player.prototype.toJSON = function() {
  return {
    id: this.id,
    color: this.color
  };
};


module.exports = Player;
