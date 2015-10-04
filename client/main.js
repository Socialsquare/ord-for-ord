var App = require('./app'),
    onDomReady = require('./lib/dom-ready');


onDomReady(function() {
  // For debugging purposes
  window.App = App;
  window.Socket = require('./lib/socket');

  // Star the app
  App.start();
});
