/** @jsx React.DOM */
var Backbone = require('backbone'),
    Socket = require('../lib/socket'),
    App = require('../app'),
    PlayerCollection = require('./player');

var Game = Backbone.Model.extend({
  defaults: { },

  initialize: function() {
    this.players = new PlayerCollection();
    Socket.on('player:add', (player) => {
      this.players.add(player);
    });
    Socket.on('player:remove', (playerId) => {
      this.players.remove(playerId);
    });
  },

  joinLobby: function() {
    Socket.exec('game:join').then((game) => {
      this.set(game);
      this.parsePlayers();
      if (this.get('state') === 'lobby') {
        App.setState('lobby');
      }
    });
  },

  parsePlayers: function() {
    this.players.add(this.get('players'));
    this.set('players', null);
  }

});

module.exports = new Game();
