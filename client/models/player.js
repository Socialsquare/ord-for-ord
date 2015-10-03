/** @jsx React.DOM */
var Backbone = require('backbone'),
    Socket = require('../lib/socket');

var Player = Backbone.Model.extend({
  defaults: {
    ready: false
  },

  setReady: function(ready) {
    Socket.exec('player:ready', ready);
    this.set('ready', ready);
  },

  isJudge: function() {
    var game = require('./game');
    return game.get('judgeId') === this.get('id');
  }

});

var PlayerCollection = Backbone.Collection.extend({
  model: Player
});

PlayerCollection.model = Player;

module.exports = PlayerCollection;
