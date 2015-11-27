/** @jsx React.DOM */
var React = require('react'),
    App = require('../app'),
    game = require('../models/game'),
    sharedConfig = require('../../lib/shared-config'),
    ScoreComponent = require('./score');
    vh = require('../lib/view-helpers');

var PROGRESS_INTERVAL = 300;

var WelcomeComponent = React.createClass({
  getInitialState: function() {
    return {
      timePassed: 0,
      claimedWords: []
    };
  },

  componentWillMount: function() {
    game.words.on('change add remove', () => {
      this.forceUpdate();
    });

    game.on('change:currentPlayerId', () => {
      this.setState({ timePassed: 0, claimedWords: [] });
    });

    this.progressInterval = setInterval(() => {
      this.setState({ timePassed: this.state.timePassed + PROGRESS_INTERVAL });
    }, PROGRESS_INTERVAL);
  },

  componentWillUnmount: function() {
    game.words.off('change add remove');
    game.off('change:currentPlayerId');
    clearInterval(this.progressInterval);
  },

  submitWord: function(e) {
    e.preventDefault();

    if(this.state.timePassed < 900) {
      // To fast response ...
      return false;
    }

    var wordDOM = React.findDOMNode(this.refs.word),
        word = wordDOM.value.trim();

    // Prevent empty words
    if (!word) { return; }

    if (game.currentPlayer().get('id') === App.player().get('id')) {
      game.appendWord(word);
    } else {
      game.claimWord(word).then((success) => {
        if (success === true) {
          var claimedWords = this.state.claimedWords;
          claimedWords.push(word);
          this.setState({ claimedWords: claimedWords });
        }
      });
    }

    wordDOM.value = '';
  },

  terminate: function(e) {
    game.terminate();
  },

  answer: function(word) {
    if (this.yourTurn() === true) {
      game.guessWord(word);
    }
  },

  yourTurn: function() {
    var currentPlayer = game.currentPlayer();
    return currentPlayer && App.player().get('id') === currentPlayer.get('id');
  },

  render: function() {
    var panelClasses = 'panel game-panel',
        progressClasses = 'progress-bar',
        currentPlayer = game.currentPlayer(),
        colorClass = '',
        yourTurn = false,
        formClass = '',
        helpTextClasses = 'help-text',
        progressStyle = {
          width: (this.state.timePassed / sharedConfig.turnLength) * 100 + '%'
        };

    if (currentPlayer) {
      colorClass = 'pcolor-' + currentPlayer.get('color');
      yourTurn = this.yourTurn();
    }

    if (yourTurn === true) {
      panelClasses += ' ' + colorClass;
      helpTextClasses += ' white';
    } else {
      progressClasses += ' ' + colorClass;
      formClass = 'pcolor-' + App.player().get('color');
    }

    var words = game.get('words').map(function(word, i) {
      if (word.guessedBy || i === 0) {
        var classes = 'word';
        if (word.guessedBy) {
          var player = game.players.get(word.guessedBy);
          classes += ' tcolor-' + player.get('color');
        }

        return (
          <div className={classes} key={i}>
            {word.correct}
          </div>
        );
      } else {
        return null;
      }
    });

    var currentWord = game.currentWord();
    var wordOptions = currentWord.options.map((word, i) => {
      var guessed = currentWord.guesses.indexOf(word) !== -1;
      return (
        <button
          onClick={this.answer.bind(this, word)}
          className={ guessed ? 'guessed' : ''}>
          {word.toLowerCase()}
        </button>
      );
    });

    return (
      <div className={panelClasses}>
        <div className={progressClasses} style={progressStyle}/>
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12">
              <div className="word-list m-t-md">
                {words}
              </div>

              <div>
                <div className={helpTextClasses}>
                  { yourTurn === true ?
                    <span>Det er din tur!</span>
                  :
                    <span>
                      Det er din modstanders tur, skynd dig at gæt hvad der
                      bliver skrevet og tag del i gevinsten
                    </span>
                  }
                </div>

                <div className="word-options">
                  {wordOptions}
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = WelcomeComponent;
