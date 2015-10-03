/** @jsx React.DOM */
var React = require('react'),
    game = require('../models/game');


var WelcomeComponent = React.createClass({
  joinLobby: function() {
    game.joinLobby();
  },

  render: function() {
    return (
      <div className="panel">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12">
              <div className="page-header m-t-lg">
                <h1>In Other Words</h1>
              </div>
              <p>&#8216;In Other Words&#8217; is a multiplayer word game challenging
              your inner wordsmith. Use words represented in as many book titles as
              possible and challenge your friends in building new sentences.</p>
              <p>In Other Words - have fun!</p>
            </div>
          </div>
        </div>
        <footer className="footer">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-6 col-xs-offset-3">
                <button type="button" className="btn btn-primary btn-lg btn-block"
                  onClick={this.joinLobby}>Join Game</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

});

module.exports = WelcomeComponent;
