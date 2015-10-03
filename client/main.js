var app = require('./app'),
    onDomReady = require('./lib/dom-ready');

onDomReady(function() {
  app.start();
});
