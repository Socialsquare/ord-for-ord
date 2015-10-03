/** @jsx React.DOM */
var React = require('react'),
    App = require('./app');

var components = {
  'welcome': require('./components/welcome'),
  'lobby': require('./components/lobby')
};

var AppLayout = React.createClass({
  getInitialState: function() {
    return { screen: App.state };
  },

  componentWillMount: function() {
    App.on('state:change', (state) => { 
      this.setState({ screen: state });
    });
  },

  componentWillUnmount: function() {
    App.removeAllListeners('state:change');
  },

  render: function() {
    var Component = components[this.state.screen];

    return (
      <div> <Component /> </div>
    );
  }
});


module.exports = AppLayout;
