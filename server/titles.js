TitleService = {
  client: null,
  init: function(settings, index) {
    var elasticsearch = Meteor.npmRequire('elasticsearch');
    this.client = new elasticsearch.Client(settings);
  },
  check: function() {
    // Check that the index is ready
    var indexExists = this.client.indices.exists({
      index: Meteor.settings.elasticsearch_index
    });

    if(!indexExists) {
      throw new Error('The index did not exist.');
    }
  }
};

/*
  Meteor.startup(function () {
    TitleService.init(Meteor.settings.elasticsearch, 'titles');
  });
 */