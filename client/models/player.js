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

  getScore: function() {
    var game = require('./game');
    return game.getScoreTable().reduce((totalScore, word) => {
      totalScore += word.scores[this.id] || 0;
      return totalScore;
    }, 0);
  }

});

var PlayerCollection = Backbone.Collection.extend({
  model: Player
});

PlayerCollection.model = Player;

module.exports = PlayerCollection;
