var es = require('elasticsearch');

var dk5 = {
  philosophy: '10',
  psychology: '13',
  science: '19',
  politics: '32',
  economics: '33',
  geography: '40',
  natural_science: '50',
  biology: '56',
  tech: '60',
  art: '70',
  music: '78',
  history: '90'
};

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
  insertMany: function(rows) {
    var actions = [];
    rows.forEach((row) => {
      actions.push({
        index: {
          _index: this.index, _type: 'book', _id: row._id
        }
      });
      delete row._id;
      actions.push(row);
    });
    return this.client.bulk({
      body: actions
    });
  },
  indexExists: function() {
    // Check that the index is ready
    return this.client.indices.exists({
      index: this.index
    });
  },
  evaluateWordScore: function(words, categories) {
    var query = [];
    if(words && words.length > 0) {
      query.push('title:"' +words.join(' ')+ '"');
    } else {
      query.push('title:*');
    }
    if(categories && categories.length > 0) {
      query.push(categories.map(function(category) {
        return 'dk5:' + dk5[category]+ '*';
      }).join(' OR '));
    }

    query = query.map(function(q) {
      return '(' + q + ')';
    }).join(' AND ');

    // console.log('Executing', query);
    var req = {
      index: this.index,
      body: {
        query: {
          query_string: {
            "query": query
          }
        }
      }
    };
    return this.client.search(req).then(function(response) {
      return response.hits.total;
    });
    /*
    var req = {
      index: this.index,
      body: {
        query: {
          match_phrase: {
            title: words.join(' ')
          }
        }
      }
    };
    if(categories && categories.length > 0) {
      req.body.query.bool = {
        should: categories.map(function(category) {
          return {
            prefix: {
              dk5: dk5[category]
            }
          };
        })
      };
    }
    return this.client.search(req).then(function(response) {
      return response.hits.total;
    });
    */
  }
};