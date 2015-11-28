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
              <h1>Ord for ord</h1>
              <p>&#8216;Ord for Ord&#8217; er et multiplayer spil, der
              udfordrer din indre ordsmed.</p>
              <p>Det gælder om, på tid og efter tur, at gætte en bogtitel ord
              for ord. Når det ikke er din tur, kan du stjæle point fra din
              modstander ved at gætte det næste ord før dem.</p>
            </div>
            <button className="btn btn-startgame btn-default" onClick={this.joinLobby}>
              <span>Videre</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = WelcomeComponent;
