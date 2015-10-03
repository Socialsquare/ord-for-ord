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

  setReady: function() {
    console.log('init game start');
    App.player().setReady(true);
  },

  setNotReady: function() {
    console.log('terminate game start');
    App.player().setReady(false);
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
            if (player.get('ready') === true) { classes.push('ready'); }
            return ( <div key={i} className={classes.join(' ')}></div> );
          })}

        </div>
        <footer className="footer">
          <button className="btn btn-primary"
            onMouseDown={this.setReady}
            onMouseUp={this.setNotReady}>Hold to start game</button>
        </footer>
      </div>
    );
  }
});


module.exports = LobbyComponent;

