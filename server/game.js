var uuid = require('uuid'),
    _ = require('lodash'),
    Promise = require("bluebird"),
    sharedConfig = require('../lib/shared-config'),
    settings = require('../settings.json'),
    titles = require('../indexing/titles').init(settings.elasticsearch, 'dbc-books-2');

Game.COLOR_COUNT = 5;
Game.WORD_CLAIM_MAX = 3;
Game.TIMEOUT = 120 * 1000;

Game.MIN_PLAYERS = 1;
Game.MAX_PLAYERS = 5;
Game.states = {
  LOBBY: 'lobby',
  LOADING: 'loading',
  PLAYING: 'playing',
  GAME_ENDED: 'game-ended'
};
Game.INITIATE_TIME = 2000;

function Game() {
  this.init();
}

Game.prototype.init = function() {
  this.id = 'ga-' + uuid.v1();
  this.state = Game.states.LOBBY;
  this.playerIds = [];
  this.players = {};
  this.words = [];
  this.currentWordIndex = 1;

  this.currentPlayerIndex = 0;
  this.claimedWords = {};

  clearTimeout(this.endTurnTimeout);
};


Game.prototype.generateMockWords = function() {
  this.words = [{
    correct: 'Kaninen'
  }, {
    correct: 'der',
    options: ['uden', 'i', 'der', 'kom', 'af'],
    guesses: []
  }, {
    correct: 'så',
    options: ['ikke', 'er', 'måske', 'så', 'hedder'],
    guesses: []
  }, {
    correct: 'gerne',
    options: ['gerne', 'Nisse', 'alligevel', 'kommer', 'længe'],
    guesses: []
  }, {
    correct: 'vil',
    options: ['må', 'Frau', 'klage', 'samle', 'vil'],
    guesses: []
  }, {
    correct: 'sove',
    options: ['sejre', 'sove', 'flyve', 'satse', 'have'],
    guesses: []
  }];
};

Game.prototype.generateWords = function() {
  return titles.generateRandomTitle().then((title) => {
    console.log('Next title is "'+title+'"' );
    var words = title.split(' ');
    var wordPromises = Promise.map(words, (word, index) => {
      var obj = { correct: word, guesses: [] };
      if(index > 0) {
        return titles.generateOptions(words[index-1], word).then((options) => {
          console.log('Possible options for', word, 'is', options.join(', '));
          obj.options = options;
          return obj;
        });
      }
      return obj;
    });
    return Promise.all(wordPromises);
  }).then((words) => {
    this.words = words;
  });
};

Game.prototype.toJSON = function() {
  return {
    id: this.id,
    state: this.state,
    players: _.values(this.players),
    words: this.words,
    currentWordIndex: this.currentWordIndex,
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
  // Clear the timeout to make sure the game is not started twice.
  clearTimeout(this.startGameTimeout);
  if (this.allPlayersReady() === true &&
    this.playerIds.length >= Game.MIN_PLAYERS) {
    this.startGameTimeout = setTimeout(() => {
      this.start();
    }, Game.INITIATE_TIME);
  }
};

Game.prototype.nextPlayerTurn = function() {
  clearTimeout(this.endTurnTimeout);

  this.currentPlayerIndex++;
  if (this.currentPlayerIndex > this.playerIds.length - 1) {
    this.currentPlayerIndex = 0;
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

Game.prototype.nextTitle = function() {
  console.log('Next title please!');

  this.words = [];
  this.state = Game.states.LOADING;
  this.currentWordIndex = 1;
  clearTimeout(this.endTurnTimeout);
  this.broadcastGameUpdate();

  this.generateWords().then(() => {
    if(this.state === Game.states.LOADING) {
      this.state = Game.states.PLAYING;
      this.broadcastGameUpdate();
    } else {
      // Let's reset the words that was just generated.
      this.words = [];
    }
  }, (err) => {
    console.error('Error generating words, using the mock state.', err.message);
    setTimeout(() => {
      this.state = Game.states.PLAYING;
      this.generateMockWords();
      this.broadcastGameUpdate();
    }, 1000); // Faking a little load time ...
  });
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

Game.prototype.resetScores = function() {
  this.playerIds.forEach((id) => {
    this.players[id].score = 0;
  });
};

Game.prototype.start = function() {
  if(Object.keys(this.players).length < Game.MIN_PLAYERS) {
    console.error('Cannot start a game with only',
                  Object.keys(this.players).length,
                  'players');
    return false;
  }
  // Starts the game, and sets it to end after the timeout
  if (this.state === Game.states.LOBBY) {
    this.gameTimeout = setTimeout(() => {
      this.end();
    }, Game.TIMEOUT);
  }
  this.resetScores();
  this.nextTitle();

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
  this.end();
  return true;
};


/*
Game.prototype.restart = function(playerId) {
  if(this.state !== Game.states.GAME_ENDED) {
    console.error('The game has to be ended to restart.');
    return false;
  }
  clearTimeout(this.gameTimeout);
  clearTimeout(this.endTurnTimeout);

  this.state = Game.states.LOBBY;
  this.words = [];
  this.broadcast('game:reset', this);
  return true;
};
*/

// Try and guess the word, and write the result
Game.prototype.guessWord = function(playerId, word) {
  if(!this.isCurrentPlayer(playerId)) {
    console.error('Only the current player can guess a word');
    return false;
  }

  var currentWord = this.words[this.currentWordIndex],
      correctGuess = currentWord.correct.toLowerCase() === word.toLowerCase();

  if (correctGuess === true) {
    // Increment the points earned by the player
    this.players[playerId].score++;
    currentWord.guessedBy = playerId;
    this.currentWordIndex++;

    if (this.currentWordIndex >= this.words.length) {
      // Restart the game - without choosing the next player.
      return this.nextTitle();
    }

  } else {
    currentWord.guesses.push(word);
  }

  this.nextPlayerTurn();

  return true;
};

module.exports = new Game();
