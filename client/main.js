var App = require('./app'),
    onDomReady = require('./lib/dom-ready');

onDomReady(function() {
  App.start();
  // For debugging purposes
  window.App = App;
  window.Socket = require('./lib/socket');
});
