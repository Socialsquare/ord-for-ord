/** @jsx React.DOM */
var React = require('react'),
    game = require('../models/game');


var WelcomeComponent = React.createClass({
  joinLobby: function() {
    game.joinLobby();
  },

  render: function() {
    return (
      <div>
        welcome to the game!
        <button onClick={this.joinLobby}>Join Lobby</button>
      </div>
    );
  }


});

module.exports = WelcomeComponent;
