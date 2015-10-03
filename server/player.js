var uuid = require('uuid');

function Player(socket) {
  this.id = 'pl-' + uuid.v1();
  this.socket = socket;
  this.color = 0;
  this.ready = false;
}

Player.prototype.toJSON = function() {
  return {
    id: this.id,
    color: this.color
  };
};

Player.prototype.setReady = function(ready) {
  this.ready = ready;
};


module.exports = Player;
