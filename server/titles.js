TitleService = {
  client: null,
  index: null,
  init: function(settings, index) {
    var elasticsearch = Meteor.npmRequire('elasticsearch');
    this.client = new elasticsearch.Client(settings);
    this.index = index;
  },
  indexExists: function() {
    // Check that the index is ready
    return this.client.indices.exists({
      index: this.index
    });
  }
};