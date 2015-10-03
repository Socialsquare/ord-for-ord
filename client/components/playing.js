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
  },

  render: function() {
    var words = game.words.map(function(word, i) {
      var player = game.players.get(word.get('playerId')),
          classes = 'pcolor-' + player.get('color');

      classes = 'word';

      return (
        <div className={classes} key={i}>{word.get('word')}</div>
      );
    });

    var panelClasses = 'panel';

    return (
      <div className="panel">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12">
              <div className="page-header m-t-lg">
                <h1>This is game</h1>
              </div>
              <div className="word-list">
                {words}
              </div>

              {App.player().isJudge() === true ?
                <div>judge!</div>
              :
                <form onSubmit={this.submitWord}>
                  <input type="text" />
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

