var uuid = require('uuid'),
    _ = require('lodash'),
    sharedConfig = require('../lib/shared-config'),
    settings = require('../settings.json'),
    titles = require('../indexing/titles').init(settings.elasticsearch, 'dbc-books');

Game.COLOR_COUNT = 5;
Game.WORD_CLAIM_MAX = 3;
Game.TIMEOUT = 120 * 1000;

Game.MIN_PLAYERS = 3;
Game.MAX_PLAYERS = 5;
Game.states = {
  LOBBY: 'lobby',
  PRE_GAME: 'pre-game',
  PLAYING: 'playing',
  GAME_ENDED: 'game-ended'
};
Game.INITIATE_TIME = 2000;

function Game() {
  this.init();
  this.generateMockState();
}

Game.prototype.init = function() {
  this.id = 'ga-' + uuid.v1();
  this.state = Game.states.LOBBY;
  this.playerIds = [];
  this.players = {};
  this.words = [];
  this.currentPlayerIndex = 0;
  this.claimedWords = {};
  clearTimeout(this.endTurnTimeout);
};

Game.prototype.generateMockState = function() {
  this.words = [{
    correct: 'Ethical'
  }, {
    correct: 'practice',
    options: ['essays', 'studies', 'practice', 'philosophies', 'theories']
  }, {
    correct: 'in',
    options: ['1550', 'in', 'parameters', '2003', 'of']
  }, {
    correct: 'everyday',
    options: ['international', 'Japan', 'Guatemala', 'macroeconomic', 'everyday']
  }, {
    correct: 'health',
    options: ['pornography', 'music', 'meteorology', 'health', 'urbanism']
  }, {
    correct: 'care',
    options: ['issues', 'Psychology', '&', 'care', 'and']
  }];
};

Game.prototype.toJSON = function() {
  return {
    id: this.id,
    state: this.state,
    players: _.values(this.players),
    judgeId: this.hasJudge() ? this.playerIds[0] : null,
    currentPlayerId: this.playerIds[this.currentPlayerIndex]
  };
};

Game.prototype.hasJudge = function() {
  return this.playerIds.length > 2 || this.state !== Game.states.PLAYING;
};

Game.prototype.getUnusedColor = function() {
  var colors = _.range(Game.COLOR_COUNT);
  for (var key in this.players) {
    var c = colors.indexOf(this.players[key].color);
    colors.splice(c, 1);
  }
  return _.shuffle(colors)[0];
};

Game.prototype.addPlayer = function(player) {
  if (player.id in this.players === false) {
    if(Object.keys(this.players).length >= Game.MAX_PLAYERS) {
      return false;
    }
    player.color = this.getUnusedColor();
    this.players[player.id] = player;
    this.playerIds.push(player.id);

    // Stop start game countdown if new player joins
    clearTimeout(this.startGameTimeout); 
    if(player.socket) {
      player.socket.join(this.id);
      player.socket.broadcast.to(this.id).emit('player:add', player.toJSON());
    }
  }
  return true;
};

Game.prototype.removePlayer = function(playerId) {
  if (playerId in this.players === true) {
    var player = this.players[playerId];
    delete this.players[playerId];
    this.playerIds.splice(this.playerIds.indexOf(playerId), 1);
    if(player.socket) {
      player.socket.broadcast.to(this.id).emit('player:remove', player.id);
      player.socket.leave(this.id);
    }
	// Too few players to actually play the game.
    if(this.playerIds.length < Game.MIN_PLAYERS) {
      // Let's re-initialize the game!
      this.init();
    }
  }
};

Game.prototype.setPlayerReady = function(playerId, ready) {
  if (playerId in this.players === true) {
    var player = this.players[playerId];
    player.setReady(ready);
    player.socket.broadcast.to(this.id).emit('player:update', player.id,
      { ready: ready });
    this.tryToStartGameCountDown();
  }
};

Game.prototype.allPlayersReady = function() {
  for (var key in this.players) {
    if (this.players[key].ready === false) {
      return false;
    }
  }
  return true;
};

Game.prototype.tryToStartGameCountDown = function() {
  if (this.allPlayersReady() === true && 
    this.playerIds.length >= Game.MIN_PLAYERS) {
    this.startGameTimeout = setTimeout(() => {
      this.start();
    }, Game.INITIATE_TIME);
  } else {
    clearTimeout(this.startGameTimeout);
  }
};

Game.prototype.nextPlayerTurn = function() {
  if (this.state === Game.states.PRE_GAME) {
    this.gameTimeout = setTimeout(() => {
      this.end();
    }, Game.TIMEOUT);
  }

  this.state = Game.states.PLAYING;
  this.currentPlayerIndex++;
  if (this.currentPlayerIndex > this.playerIds.length - 1) {
    this.currentPlayerIndex = this.hasJudge() ? 1 : 0;
  }
  this.broadcastGameUpdate();

  this.claimedWords = {};

  // End turn if the player doesn't end it before the time runs out
  this.endTurnTimeout = setTimeout(
    this.nextPlayerTurn.bind(this), sharedConfig.turnLength);
};

Game.prototype.nextJudge = function() {
  var currentJudge = this.playerIds.shift();
  this.playerIds.push(currentJudge);
};

Game.prototype.isJudge = function(playerId) {
  if(this.playerIds.length > 0) {
    return this.playerIds[0] === playerId;
  }
  return false;
};

Game.prototype.isCurrentPlayer = function(playerId) {
  return this.playerIds[this.currentPlayerIndex] === playerId;
};

Game.prototype.broadcast = function() {
  this.playerIds.forEach((id) => {
    var sock = this.players[id].socket;
    sock.emit.apply(sock, arguments);
  });
};

Game.prototype.broadcastGameUpdate = function() {
  this.broadcast('game:update', this);
};

Game.prototype.start = function() {
  if(Object.keys(this.players).length < Game.MIN_PLAYERS) {
    console.error('Cannot start a game with only',
                  Object.keys(this.players).length,
                  'players');
    return false;
  }
  this.state = Game.states.PRE_GAME;
  this.broadcastGameUpdate();
  return true;
};

Game.prototype.end = function() {
  clearTimeout(this.endTurnTimeout);
  clearTimeout(this.gameTimeout);
  this.state = Game.states.GAME_ENDED;
  this.nextJudge();
  this.currentPlayerIndex = 0;
  this.broadcastGameUpdate();
};

Game.prototype.terminate = function(playerId) {
  if(this.state !== Game.states.PLAYING) {
    console.error('The game has to be in playing state to terminate.');
    return false;
  }
  if(!this.isJudge(playerId)) {
    console.error('Only the judge can terminate the game.');
    return false;
  }
  this.end();
  return true;
};

Game.prototype.setCategories = function(playerId, categories) {
  if(this.state !== Game.states.PRE_GAME) {
    console.error('The game has to be in pre game state to change categories.');
    return false;
  }
  if(!this.isJudge(playerId)) {
    console.error('Only the judge can change categories for the game.');
    return false;
  }

  this.categories = categories;
  return titles.evaluateWordScore(undefined, this.categories).then((score) => {
    //console.log('Choosing', this.categories, 'gives', score, 'records');
    return score;
  });
};

Game.prototype.restart = function(playerId) {
  if(this.state !== Game.states.GAME_ENDED) {
    console.error('The game has to be ended to restart.');
    return false;
  }
  if(!this.isJudge(playerId)) {
    console.error('Only the judge can restart the game.');
    return false;
  }
  clearTimeout(this.gameTimeout);
  clearTimeout(this.endTurnTimeout);
  this.state = Game.states.PRE_GAME;
  this.words = [];
  this.broadcast('game:reset', this);
  return true;
};

Game.prototype.claimWord = function(playerId, word) {
  word = word.toLowerCase();
  if (playerId in this.claimedWords === false) {
    this.claimedWords[playerId] = [];
  }
  if (this.claimedWords[playerId].length < Game.WORD_CLAIM_MAX) {
    this.claimedWords[playerId].push(word);
    return true;
  }
  return false;
};

Game.prototype.appendWord = function(playerId, word) {
  word = word.toLowerCase();
  clearTimeout(this.endTurnTimeout);
  if(!this.isCurrentPlayer(playerId)) {
    console.error('Only the current player can append a word');
    return false;
  }
  if(this.state === Game.states.PRE_GAME && this.currentPlayerIndex !== 0) {
    console.error('In the pre-game state, only the judge appends a word');
    return false;
  }
  if(this.state !== Game.states.PLAYING && this.currentPlayerIndex > 0) {
    console.error('In the playing state, the judge cannot append words');
    return false;
  }

  
  var successfulClaims = [];
  for (var key in this.claimedWords) {
    if (this.claimedWords[key].indexOf(word) !== -1) {
      successfulClaims.push(key);
    }
  }

  this.nextPlayerTurn();

  var wordObj = {
    id: 'wd-'+this.words.length,
    word: word,
    playerId: playerId,
    score: null,
    successfulClaims: successfulClaims
  };
  this.words.push(wordObj);
  this.broadcast('word:append', wordObj);

  if(this.words.length >= 2) {
    var lastWords = this.words.slice(-2).map(function(w) {
      return w.word;
    });
    titles.evaluateWordScore(lastWords, this.categories).then((score) => {
      wordObj.score = score;
      this.broadcast('word:update', wordObj);
    });
  }
};

Game.prototype.getOptions = function() {
  // Returns a list of 5 words, where one of the words is the right next word
  // for the user to select.
  // this.words.options
};

module.exports = new Game();
