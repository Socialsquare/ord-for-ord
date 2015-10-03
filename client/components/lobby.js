/** @jsx React.DOM */
var React = require('react'),
    game = require('../models/game'),
    App = require('../app');


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

  initiateGameStart: function() {
    console.log('init game start');
    App.player.initiateGameStart();
  },

  terminateGameStart: function() {
    console.log('terminate game start');
    App.player.terminateGameStart();
  },

  render: function() {

    return (
      <div>
        <div className="container-fluid">
          <h3>Players in Lobby</h3>
          {game.players.map(function(player, i) {
            var classes = [];
            classes.push('player-icon');
            classes.push('pcolor-' + player.get('color'));
            return ( <div key={i} className={classes.join(' ')}></div> );
          })}

        </div>
        <footer className="footer">
          <button className="btn btn-primary"
            onMouseDown={this.initiateGameStart}
            onMouseUp={this.terminateGameStart}>Hold to start game</button>
        </footer>
      </div>
    );
  }
});


module.exports = LobbyComponent;

