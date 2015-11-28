/** @jsx React.DOM */
var React = require('react'),
    game = require('../models/game'),
    App = require('../app');

var READY_QUOTES = [
  'Start'
  // 'Press for success!',
  // 'Press to impress!',
  // 'Tiden er knap ...',
  // 'Lick to click',
  // 'Beam me up, Scotty!',
  // 'Pres lappen mod knappen',
  // 'Få luffen ud af muffen'
];

var LobbyComponent = React.createClass({
  getInitialState: function() {
    return {
      readyQuote: READY_QUOTES[Math.floor(READY_QUOTES.length * Math.random())]
    };
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
      pulseClass += ' active';
    }

    var startMessage = '';
    var startButton = 'hidden';
    if(game.players.length <= 1) {
      startMessage = 'I skal være 2-5 spillere';
    }
    if(game.players.length >= 2) {
      startMessage = 'Spillet starter når alle holder knappen nede';
      startButton = '';
    }

    return (
      <div className="panel"
        onTouchEnd={this.setNotReady}
        onMouseUp={this.setNotReady}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 text-center">
              <h3>Venter på andre spillere</h3>
              <p>{startMessage}</p>
              {game.players.map(function(player, i) {
                var classes = [];
                classes.push('player-icon');
                classes.push('pcolor-' + player.get('color'));
                if (player.get('ready') === true) { classes.push('ready'); }
                return (
                  <div key={i} className={classes.join(' ')}><div className="no-check"><svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 14c4.5 0 8 1 8 6h-16c0-5 3.5-6 8-6zm0-10c2.194 0 4 1.806 4 4s-1.806 4-4 4-4-1.806-4-4 1.806-4 4-4z"/></svg></div><div className="check"><svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 14c4.5 0 8 1 8 6h-16c0-5 3.5-6 8-6zm6-5l5 5 8-8-2-2-6 6-3-3-2 2zm-6-5c2.194 0 4 1.806 4 4s-1.806 4-4 4-4-1.806-4-4 1.806-4 4-4z"/></svg></div></div> );
              })}
            </div>
            <div className={startButton}>
              <div id="onePulse" className={pulseClass}></div>
              <div id="twoPulse" className={pulseClass}></div>
              <button className={buttonClasses} onTouchStart={this.setReady} onMouseDown={this.setReady}><span>{this.state.readyQuote}</span></button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = LobbyComponent;
