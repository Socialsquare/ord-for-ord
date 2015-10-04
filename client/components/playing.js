/** @jsx React.DOM */
var React = require('react'),
    App = require('../app'),
    game = require('../models/game'),
    sharedConfig = require('../../lib/shared-config');
    
var PROGRESS_INTERVAL = 300;

var WelcomeComponent = React.createClass({
  getInitialState: function() {
    return {  
      timePassed: 0
    };
  },
  
  componentWillMount: function() {
    game.words.on('change add remove', () => {
      this.forceUpdate();
    });

    game.on('change:currentPlayerId', () => {
      this.setState({ timePassed: 0 });
    });

    setInterval(() => {
      this.setState({ timePassed: this.state.timePassed + PROGRESS_INTERVAL });
    }, PROGRESS_INTERVAL);
  },

  componentWillUnmount: function() {
    game.words.off('change add remove');
    game.off('change:currentPlayerId');
  },

  submitWord: function(e) {
    e.preventDefault();
    var wordDOM = React.findDOMNode(this.refs.word);
    game.appendWord(wordDOM.value.trim());
    wordDOM.value = '';
  },

  terminate: function(e) {
    game.terminate();
  },

  render: function() {
    var panelClasses = 'panel',
        progressClasses = 'progress-bar',
        currentPlayer = game.currentPlayer(),
        colorClass = '',
        yourTurn = false,
        progressStyle = { 
          width: (this.state.timePassed / sharedConfig.turnLength) * 100 + '%'
        };

    if (currentPlayer) {
      colorClass = 'pcolor-' + currentPlayer.get('color');
      yourTurn = App.player().get('id') === currentPlayer.get('id');
    }

    if (yourTurn === true) { panelClasses += ' ' + colorClass; 
    } else { progressClasses += ' ' + colorClass; }

    var words = game.words.map(function(word, i) {
      var player = game.players.get(word.get('playerId')),
          classes = 'tcolor-' + player.get('color');

      classes = 'word';
      return ( <div className={classes} key={i}>{word.get('word')}</div> );
    });

    return (
      <div className={panelClasses}>
        <div className={progressClasses} style={progressStyle}/>
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12">
              <div className="word-list">
                {words}
              </div>

              {App.player().isJudge() === true ?
                <button onClick={this.terminate}>Sludder og vrøvl!</button>
              :
                <form onSubmit={this.submitWord}>
                  <input type="text" autoFocus="true" ref="word" />
                  <button className="submit-button" />
                </form>
              }

            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = WelcomeComponent;

