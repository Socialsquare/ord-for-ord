/** @jsx React.DOM */
var React = require('react'),
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

  render: function() {
    var words = game.words.map(function(word, i) {
      var player = game.players.get(word.get('playerId')),
          classes = 'pcolor-' + player.get('color');

      classes += ' word';

      return (
        <div className={pColor} key={i}>{word.get('word')}</div>
      );
    });

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
            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = WelcomeComponent;

