/** @jsx React.DOM */
var React = require('react'),
    game = require('../models/game');


var LobbyComponent = React.createClass({
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
      <div>
        <h3>Players in Lobby</h3>
        {game.players.map(function(player, i) {
          var classes = [];
          classes.push('player-icon');
          classes.push('pcolor-' + player.get('color'));
          return ( <div key={i} className={classes.join(' ')}></div> );
        })}
      </div>
    );
  }
});


module.exports = LobbyComponent;

