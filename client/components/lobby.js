/** @jsx React.DOM */
var React = require('react');


var LobbyComponent = React.createClass({
  getInitialState: function() {
    return { };
  },

  render: function() {
    return (
      <div>
        Welcome to the lobby!  
      </div>
    );
  }
});


module.exports = LobbyComponent;

