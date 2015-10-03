/** @jsx React.DOM */
var React = require('react'),
    game = require('../models/game');


var PreGameComponent = React.createClass({
  getInitialState: function() {
    return { };
  },

  componentWillMount: function() {
    game.players.on('change add remove', () => {
      this.forceUpdate();
    });
  },

  componentWillUnmount: function() {
    game.players.off('change add remove');
  },

  render: function() {
    return (
      <div className="panel">
        <h3>Playing</h3>
        {game.players.map(function(player, i) {
          var classes = [];
          classes.push('player-icon');
          classes.push('pcolor-' + player.get('color'));
          return ( <div key={i} className={classes.join(' ')}></div> );
        })}
        {App.player().isGameMaster() ? ( <input autoFocus="true" /> ) : null}
      </div>
    );
  }
});


module.exports = PreGameComponent;
