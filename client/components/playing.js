/** @jsx React.DOM */
var React = require('react'),
    App = require('../app'),
    game = require('../models/game'),
    sharedConfig = require('../../lib/shared-config'),
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
      // Only a non-judge player has a word button.
      if(!App.player().isJudge()) {
        React.findDOMNode(this.refs.word).value = '';
      }
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

  render: function() {
    var panelClasses = 'panel game-panel',
        progressClasses = 'progress-bar',
        currentPlayer = game.currentPlayer(),
        colorClass = '',
        yourTurn = false,
        formClass = '',
        progressStyle = {
          width: (this.state.timePassed / sharedConfig.turnLength) * 100 + '%'
        };

    if (currentPlayer) {
      colorClass = 'pcolor-' + currentPlayer.get('color');
      yourTurn = App.player().get('id') === currentPlayer.get('id');
    }

    if (yourTurn === true) {
      panelClasses += ' ' + colorClass;
    } else {
      progressClasses += ' ' + colorClass;
      formClass = 'pcolor-' + App.player().get('color');
    }

    var words = game.words.map(function(word, i) {
      var player = game.players.get(word.get('playerId')),
          classes = 'tcolor-' + player.get('color'),
          claims = null;
      classes += ' word';

      if (word.get('successfulClaims')) {
        claims = (
          <div className="claims">
            {word.get('successfulClaims').map(function(playerId) {
              var player = game.players.get(playerId),
                  classes = 'claim pcolor-' + player.get('color');
              return (
                <div key={playerId} className={classes} />
              );
            })}
          </div>
        );
      }

      return (
        <div className={classes} key={i}>
          {word.get('word')}
          {claims}
        </div>
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

              {App.player().isJudge() === true ?
                <button className="btn btn-startgame btn-default"
                  onClick={this.terminate}>
                  <span>Sludder og vrøvl!</span>
                </button>
              :
                <div>
                  {this.state.claimedWords.map((word, i) => {
                    return ( <span key={i}>{word}</span> );
                  })}

                  <form onSubmit={this.submitWord} className={formClass}>
                    <input type="text" autoFocus="true" ref="word"
                      placeholder="Indtast ord" 
                      onKeyPress={vh.preventCharacters} />
                    <button className="submit-button" />
                  </form>
                </div>
              }

            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = WelcomeComponent;
