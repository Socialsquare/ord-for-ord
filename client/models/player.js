/** @jsx React.DOM */
var Backbone = require('backbone'),
    Socket = require('../lib/socket');

var Player = Backbone.Model.extend({
});

var PlayerCollection = Backbone.Collection.extend({
  model: Player
});


module.exports = PlayerCollection;
