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
        {game.players.map(function(player, i) {
          return ( <div key={i}>{player.get('id')}</div> );
        })}
      </div>
    );
  }
});


module.exports = LobbyComponent;

