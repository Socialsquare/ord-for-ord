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
              for ord.</p>
              <p>Spillet henter skønlitterære bogtitler fra <a
              href="https://opensource.dbc.dk">dbc.dk</a> og kildekoden er
              tilgængelig på <a
              href="https://github.com/Socialsquare/ord-for-ord">
              github.com/socialsquare/ord-for-ord</a>.</p>
            </div>
            <button className="btn btn-startgame btn-default"
            onClick={this.joinLobby}>
              <span>Videre</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = WelcomeComponent;
