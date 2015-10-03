/** @jsx React.DOM */
var React = require('react'),
    EventEmitter = require('events'),
    Socket = require('./lib/socket');

Socket.connect();

var events = new EventEmitter();
var App = {
  channel: null,
  on: events.on.bind(events),
  emit: events.emit.bind(events),
  once: events.once.bind(events),

  start: function() {

    Socket.on('welcome', function(ha) {
      console.log(ha);
    });

    console.log('app starting');
    React.render(<AppLayout />, document.body);
  }
};


var AppLayout = React.createClass({
  getInitialState: function() {
    return { };
  },

  render: function() {
    return (
      <div>
        Hey!
      </div>
    );
  }
});


module.exports = App;

