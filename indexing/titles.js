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

Array.prototype.getUnique = function() {
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

module.exports = {
  init: function(settings, index) {
    this.client = new es.Client(settings);
    this.index = index;
    return this;
  },
  ensureIndex: function() {
    return this.indexExists().then((exists) => {
      if(!exists) {
        return this.client.indices.create({
          index: this.index,
          body: {
            mappings: {
              book: {
                properties: {
                  title: { type: 'string', analyzer: 'keyword' }
                }
              }
            }
          }
        });
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
  },
  generateWordRegExp: function() {
    // TODO: Consider adding æ-å
    return '[a-zA-Z]+[,.:?]?';
  },
  generateTitleRegExp: function(minWordCount, maxWordCount) {
    var word = this.generateWordRegExp();
    return word + '( '+word+'){'+(minWordCount-1)+','+(maxWordCount-1)+'}' + '[\.!]?';
  },
  generateRandomTitle: function() {
    var query = {
      function_score: {
        filter: {
          regexp: {
            title: {
              value: this.generateTitleRegExp(5, 10)
            }
          }
        },
        functions: [{
          random_score: {
            seed: Math.round(Math.random()*Number.MAX_SAFE_INTEGER)
          }
        }],
        score_mode: 'sum'
      }
    };

    return this.client.search({
      index: this.index,
      body: { query: query },
      size: 1
    }).then((response2) => {
      if(response2.hits.hits.length === 1) {
        return response2.hits.hits[0]._source.title;
      }
    });
  },
  generateOptions: function(prefixedWord, correct) {
    var word = this.generateWordRegExp();
    var query = {
      regexp: {
        title: {
          value: '(.* )?'+prefixedWord+' .*'
        }
      }
    };

    return this.client.search({
      index: this.index,
      body: { query: query },
      size: 25
    }).then((response) => {
      var possibleOptions = response.hits.hits.map((hit) => {
        var title = hit._source.title;
        var possibleOption = title.match('(?:.* )?'+prefixedWord+' ('+word+')(?: .*)?');
        if(possibleOption) {
          return possibleOption[1];
        } else {
          return null;
        }
      });
      var options = possibleOptions.filter((word) => {
        return word !== null;
      });
      // Shuffle all the generated options.
      options = shuffle(options);
      // Insert the correct value.
      options.unshift(correct);
      // Make sure we have only unique values
      options = options.getUnique();
      // Pick the first five
      options = options.slice(0, 5);
      // Shuffle again with the correct value added.
      return shuffle(options);
    });
  }
};