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
              <p>&#8216;In Other Words&#8217; er et multiplayer ordspil der
              udfordre dine evner som ordsmed. Det gælder om, på tid og efter
              tur, at vælge ord og ordsammensætninger der er repræsenteret i
              så mange bogtitler som muligt - og dermed sammensætte andres ord
              til ny mening.</p>
              <p>Med andre ord - ha&#8217; det grinern</p>
              <div className="style-select dropdown-toggle">
                <select id="category-select">
                  <option selected disabled>Vælg en kategori</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <button className="btn btn-startgame btn-default"
          onClick={this.joinLobby}>Videre</button>
      </div>
    );
  }

});

module.exports = WelcomeComponent;
