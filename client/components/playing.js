/** @jsx React.DOM */
var React = require('react'),
    App = require('../app'),
    game = require('../models/game');
    


var WelcomeComponent = React.createClass({
  componentWillMount: function() {
    game.words.on('change add remove', () => {
      this.forceUpdate();
    });
  },

  componentWillUnmount: function() {
    game.words.off('change add remove');
  },

  submitWord: function(e) {
    e.preventDefault();
    var wordDOM = React.findDOMNode(this.refs.word);
    game.appendWord(wordDOM.value.trim());
    wordDOM.value = '';
  },

  render: function() {
    var panelClasses = 'panel',
        progressClasses = 'progress-bar',
        currentPlayer = game.currentPlayer(),
        colorClass = '',
        yourTurn = false;

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
        <div className={progressClasses}/>
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12">
              <div className="word-list">
                {words}
              </div>

              {App.player().isJudge() === true ?
                <div>judge!</div>
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

