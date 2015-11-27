/** @jsx React.DOM */
var Backbone = require('backbone'),
    Socket = require('../lib/socket'),
    App = require('../app'),
    PlayerCollection = require('./player');


var Game = Backbone.Model.extend({
  defaults: {
    currentPlayerId: null,
    currentWordIndex: 0
  },

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

    Socket.on('game:reset', (game) => {
      this.words.reset();
      this.set(game);
    });

    this.on('change:state', (self, state) => {
      App.setState(state);
    });
  },

  currentWord: function() {
    var i = this.get('currentWordIndex');
    return this.get('words')[i];
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

  guessWord: function(word) {
    Socket.emit('word:guess', word);
  },

  setCategories: function(categories) {
    return Socket.exec('game:categories', categories);
  },

  terminate: function(word) {
    Socket.exec('game:terminate');
  },

  restart: function(word) {
    Socket.exec('game:restart');
  },

  currentPlayer: function() {
    var id = this.get('currentPlayerId');
    if (id) {
      return this.players.get(id);
    }
    return null;
  },

  getScoreTable: function() {
    var players = this.players.map((player) => { return player.get('id') });

    return this.words.map((word) => {
      var dividedAmongst = 1 + word.get('successfulClaims').length,
          scoreDivided = Math.ceil(word.get('score') / dividedAmongst);

      var scores = {};
      players.forEach((playerId) => {
        var score = 0;
        if (word.get('playerId') === playerId ||
          word.get('successfulClaims').indexOf(playerId) !== -1) {
          score = scoreDivided;
        }
        scores[playerId] = score;
      });

      return {
        word: word.get('word'),
        scores: scores
      };
    });
  }

});

module.exports = new Game();
