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
        <div className="container-fluid">
          <div className="page-header">
            <h1>Welcome to the game!</h1>
          </div>
          <p>&#8216;In Other Words&#8217; is a multiplayer word game challenging your inner wordsmith. Use words represented in as many book titles as possible and challenge your friends in building new sentences.

          In Other Words - have fun!</p>


        </div>
        <footer className="footer">
          <div className="container-fluid">
            <button type="button" className="btn btn-primary"
              onClick={this.joinLobby}>Join Lobby</button>
          </div>
        </footer>
      </div>
    );
  }

});

module.exports = WelcomeComponent;
