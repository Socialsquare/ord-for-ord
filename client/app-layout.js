/** @jsx React.DOM */
var React = require('react'),
    App = require('./app');

var components = {
  'welcome': require('./components/welcome'),
  'lobby': require('./components/lobby'),
  'loading': require('./components/loading'),
  'pre-game': require('./components/pre-game'),
  'playing': require('./components/playing'),
  'game-ended': require('./components/game-ended')
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
    return <Component />;
  }
});


module.exports = AppLayout;
