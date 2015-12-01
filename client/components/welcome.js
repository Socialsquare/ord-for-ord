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
              <h1>Ord For Ord</h1>
              <p>&#8216;Ord For Ord&#8217; er et multiplayer spil, der
              udfordrer din indre ordsmed. Det gælder om, på tid og efter tur,
              at gætte en bogtitel ord for ord.</p>
              <p>Del spillet og udfordr dine venner!</p>
              <p className="social">
              <a href="https://www.facebook.com/sharer/sharer.php?u=http%3A//ord-for-ord.socialsquare.dk" className="facebook"><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M17 2v3h-2c-.549 0-1 .451-1 1v2h3v3h-3v7h-3v-7h-2v-3h2v-2.5c0-1.94 1.57-3.5 3.5-3.5h2.5z"/></svg></a>
              <a href="https://twitter.com/intent/tweet?text=Et%20socialt%20spil%2C%20der%20udfordrer%20din%20indre%20bogorm.%20Det%20g%C3%A6lder%20om%2C%20p%C3%A5%20tid%20og%20efter%20tur%2C%20at%20g%C3%A6tte%20en%20bogtitel%20ord%20for%20ord.%20%23ordforord" className="twitter"><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M15.71 7.33c-.07 4.62-3.02 7.78-7.43 7.98-1.82.08-3.13-.5-4.28-1.23 1.34.21 3-.32 3.9-1.08-1.32-.14-2.09-.81-2.46-1.88.38.06.78.04 1.14-.03-1.19-.4-2.04-1.14-2.08-2.68.33.16.68.3 1.14.33-.89-.51-1.54-2.36-.79-3.58 1.32 1.45 2.91 2.63 5.52 2.79-.66-2.8 3.05-4.32 4.6-2.45.66-.12 1.19-.36 1.71-.64-.21.64-.62 1.11-1.12 1.47.54-.07 1.03-.2 1.44-.41-.25.53-.81 1.01-1.29 1.41z"/></svg></a>
              <a href="https://www.linkedin.com/shareArticle?mini=true&url=http%3A//ord-for-ord.socialsquare.dk&title=Ord%20For%20Ord&summary=Et%20socialt%20spil,%20der%20udfordrer%20din%20indre%20bogorm.%20Det%20g%C3%A6lder%20om,%20p%C3%A5%20tid%20og%20efter%20tur,%20at%20g%C3%A6tte%20en%20bogtitel%20ord%20for%20ord.&source=" className="linkedin"><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M17 17h-3v-5.3c0-.823-.677-1.5-1.5-1.5s-1.5.677-1.5 1.5v5.3h-3v-9h3v1.2c.5-.84 1.59-1.4 2.5-1.4 1.92 0 3.5 1.58 3.5 3.5v5.7zm-11 0h-3v-9h3v9zm-1.5-10.69c-1 0-1.81-.81-1.81-1.81 0-.993.817-1.81 1.81-1.81 1 0 1.81.81 1.81 1.81 0 .993-.817 1.81-1.81 1.81z"/></svg></a>
              <a href="https://plus.google.com/share?url=http%3A//ord-for-ord.socialsquare.dk" className="googleplus"><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M7 9.29v1.71h2.86c-.15.71-.86 2.14-2.86 2.14-1.71 0-3.07-1.43-3.07-3.14 0-1.71 1.36-3.14 3.07-3.14 1 0 1.64.43 2 .78l1.36-1.28c-.86-.86-2-1.36-3.36-1.36-2.79 0-5 2.21-5 5s2.21 5 5 5c2.86 0 4.79-2 4.79-4.86 0-.35 0-.57-.08-.85h-4.71zm11 .71h-2v-2h-1v2h-2v1h2v2h1v-2h2v-1z"/></svg></a>
              </p>
            </div>
            <button className="btn btn-startgame btn-default"
            onClick={this.joinLobby}>
              <span>Videre</span>
            </button>
            <a href="https://github.com/Socialsquare/ord-for-ord#ord-for-ord" className="info social"><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M9 7h2v-2h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m0-18c-5.486 0-10 4.514-10 10s4.514 10 10 10 10-4.514 10-10-4.514-10-10-10m-1 15h2v-6h-2v6z"/></svg></a>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = WelcomeComponent;
