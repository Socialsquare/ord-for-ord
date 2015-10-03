/** @jsx React.DOM */
var Backbone = require('backbone'),
    Socket = require('../lib/socket'),
    App = require('../app');

var Game = Backbone.Model.extend({
  defaults: { },

  initialize: function() {

  },

  joinLobby: function() {
    Socket.exec('game:join').then((game) => {
      this.set(game);
      if (this.get('state') === 'lobby') {
        App.setState('lobby');
      }
    });
  }

});

module.exports = new Game();
