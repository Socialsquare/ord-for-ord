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
    App.player().setReady(true);
  },

  setNotReady: function() {
    App.player().setReady(false);
  },

  render: function() {

    var playerColor = 'pcolor-' + (App.player() ? App.player().get('color') : 0);
    var buttonClasses = 'btn btn-startgame';
    buttonClasses += ' ' + playerColor;
    var pulseClass = 'pulse';
    pulseClass += ' ' + playerColor;
    if (App.player() && App.player().get('ready') === true) {
      buttonClasses += ' active';
    }

    return (
      <div className="panel"
        onTouchEnd={this.setNotReady}
        onMouseUp={this.setNotReady}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 m-t-lg text-center">
              <h3>Players in Lobby</h3>
              {game.players.map(function(player, i) {
                var classes = [];
                classes.push('player-icon');
                classes.push('pcolor-' + player.get('color'));
                if (player.get('ready') === true) { classes.push('ready'); }
                return ( <div key={i} className={classes.join(' ')}></div> );
              })}
            </div>
          </div>
        </div>
        <button className={buttonClasses}
          onTouchStart={this.setReady}
          onMouseDown={this.setReady}>Hold to start game</button>
        <div id="onePulse" className={pulseClass}></div>
        <div id="twoPulse" className={pulseClass}></div>
        <div id="treePulse" className={pulseClass}></div>
      </div>
    );
  }
});


module.exports = LobbyComponent;
