var settings = require('../settings.json');
var titles = require('./titles').init(settings.elasticsearch, 'titles');

(function() {
  var csv = require('csv');
  var fs = require('fs');
  var Promise = require("bluebird");
  var progress = require('progress-stream');

  var parser = csv.parse({columns: true});

  function insert(row) {
    return Promise.resolve().then(function() {
      if(row.type === 'book') {
        return titles.insert('dbc', row.materiale_id, row.title);
      }
    });
  }

  // Only start the chain of nexts on the first readable token.
  var parsing = false;
  var parsed = 0;
  var datafile = __dirname+'/../../materialedata.csv';

  function next() {
    var row = parser.read();
    console.log(parsed);
    parsed++;
    if(row) {
      return insert(row).then(next);
    } else {
      return Promise.resolve(null);
    }
  }
  
  parser.on('readable', function() {
    if(!parsing) {
      parsing = true;
      next().then(function() {
        parsing = false;
      });
    }
  });

  // Let the streaming begin.
  fs.createReadStream(datafile)
    .pipe(parser);
})();