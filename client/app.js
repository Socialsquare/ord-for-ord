/** @jsx React.DOM */
var React = require('react'),
    EventEmitter = require('events'),
    Socket = require('./lib/socket');

var Backbone = require('backbone');
Backbone.$ = require('jquery');

Socket.connect();
Socket.on('player:me', function(player) {
  App.playerId = player.id;
});


var events = new EventEmitter();
var App = {
  playerId: null,
  player: function() {
    var game = require('./models/game');
    return game.players.get(this.playerId);
  },

  state: 'welcome',

  on: events.on.bind(events),
  removeListener: events.removeListener.bind(events),
  removeAllListeners: events.removeAllListeners.bind(events),
  emit: events.emit.bind(events),
  once: events.once.bind(events),

  setState: function(state) {
    this.state = state;
    this.emit('state:change', state);
  },

  start: function() {
    var AppLayout = require('./app-layout'),
        PlayerCollection = require('./models/player');

    React.render(<AppLayout />, document.body);
  }
};


module.exports = App;

