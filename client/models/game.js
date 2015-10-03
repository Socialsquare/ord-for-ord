/** @jsx React.DOM */
var Backbone = require('backbone'),
    Socket = require('../lib/socket'),
    App = require('../app'),
    PlayerCollection = require('./player');


var Game = Backbone.Model.extend({
  defaults: { },

  initialize: function() {
    this.players = new PlayerCollection();
    this.words = new Backbone.Collection();

    Socket.on('player:add', (player) => {
      this.players.add(player);
    });
    Socket.on('player:remove', (playerId) => {
      this.players.remove(playerId);
    });
    Socket.on('player:update', (playerId, data) => {
      var player = this.players.get(playerId);
      if (player) { player.set(data); }
    });
    Socket.on('game:update', (game) => {
      this.set(game);
    });

    Socket.on('word:append', (word) => {
      this.words.add(word);
    });

    this.on('change:state', (self, state) => {
      App.setState(state);
    });
  },

  joinLobby: function() {
    Socket.exec('game:join').then((game) => {
      this.set(game);
      this.parsePlayers();
    });
  },

  parsePlayers: function() {
    this.players.add(this.get('players'));
    this.set('players', null);
  },

  startRound: function(word) {
    console.log('start', word);
    Socket.exec('game:startRound', word);
  }

});

module.exports = new Game();
