/** @jsx React.DOM */
var Backbone = require('backbone'),
    Socket = require('../lib/socket');

var Player = Backbone.Modle.extend({
  
});

var PlayerCollection = Backbone.Collection.extend({
  model: Player,

  getUser: function() {

  }
});


module.exports = new PlayerCollection();
