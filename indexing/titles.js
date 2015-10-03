var es = require('elasticsearch');

module.exports = {
  init: function(settings, index) {
    this.client = new es.Client(settings);
    this.index = index;
    return this;
  },
  insert: function(source, id, title) {
    var _id = source + '-' + id;
    return this.client.index({
      index: this.index,
      type: 'title',
      id: _id,
      body: {
        title: title,
        source: source
      }
    });
  },
  indexExists: function() {
    // Check that the index is ready
    return this.client.indices.exists({
      index: this.index
    });
  }
};