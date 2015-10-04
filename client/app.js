/** @jsx React.DOM */
var React = require('react'),
    EventEmitter = require('events'),
    Socket = require('./lib/socket');

var Backbone = require('backbone');
Backbone.$ = require('jquery');

Socket.connect();
Socket.on('player:me', function(player) {
  //App.playerId = player.id;
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

    var game = require('./models/game');
    game.set({
      id: 'gae',
      state: 'game-ended',
      judgeId: '1',
      currentPlayerId: '2'
    });
    game.players.add({ id: '1', color: 0 });
    game.players.add({ id: '2', color: 1 });
    game.players.add({ id: '3', color: 2 });
    game.players.add({ id: '4', color: 3 });
    game.players.add({ id: '5', color: 4 });
    this.state = 'game-ended';
    this.playerId = '2';

    game.words.add({
      word: 'Hej',
      playerId: '2',
      score: 20,
      successfulClaims: []
    });

    game.words.add({
      word: 'hvad',
      playerId: '3',
      score: 20,
      successfulClaims: []
    });

    game.words.add({
      word: 'laver',
      playerId: '4',
      score: 20,
      successfulClaims: ['2', '3']
    });

    game.words.add({
      word: 'du',
      playerId: '5',
      score: 20,
      successfulClaims: []
    });

    game.words.add({
      word: 'lige',
      playerId: '2',
      score: 20,
      successfulClaims: ['4']
    });


    React.render(<AppLayout />, document.body);
  }
};


module.exports = App;

