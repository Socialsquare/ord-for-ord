var Promise = require('bluebird'),
    m       = require('mithril');

var Socket = {
  CONNECTED: {}, OFFLINE: {},

  status: null,

  connect: function() {
    var port = '';
    if(location.port) {
      port = ':' + location.port;
    }

    this.socket = io.connect('http://' + location.hostname + port);

    this.emit = this.socket.emit.bind(this.socket);
    this.on = this.socket.on.bind(this.socket);
    if (this.status === null) {
      this.socket.on('connect', function() {
        Socket.status = Socket.ONLINE;
      });
      this.socket.on('disconnected', function() {
        Socket.status = Socket.OFFLINE;
      });
    }
  },

  exec: function() {
    var args = Array.prototype.slice.call(arguments),
        self = this;
    return new Promise(function(resolve, reject) {
      args.push(function(ret) {
        resolve(ret);
        setTimeout(m.redraw, 0);
      });
      self.socket.emit.apply(self.socket, args);
    });
  },

  emit: function() { },

  on: function() { }
};



module.exports = Socket;
