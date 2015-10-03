var settings = require('../settings.json');
var titles = require('./titles').init(settings.elasticsearch, 'books');

(function() {
  var csv = require('csv');
  var fs = require('fs');
  var Promise = require("bluebird");

  var parser = csv.parse({columns: true});

  // Only start the chain of nexts on the first readable token.
  var parsing = false;
  var parsed = 0;
  var skipped = 0;
  var datafile = __dirname+'/../../materialedata.csv';

  var BATCH_SIZE = 100;
  var rows = [];
  function next() {
    var row = parser.read();
    if(row) {
      if(row.type === 'book') {
        var doc = {
          source: 'dbc',
          title: row.title,
          _id: 'dbc-'+row.materiale_id
        };

        if(row.dk5) {
          try {
            doc.dk5 = JSON.parse(row.dk5);
          } catch(err) {
            console.error(err);
          }
        }
        
        rows.push(doc);

        if(rows.length >= BATCH_SIZE) {
          console.log('Parsed:', parsed,
                      'Skipped:', skipped,
                      'Total:', parsed+skipped);
          parsed += rows.length;
          return titles.insertMany(rows).then(function() {
            // Reset the rows buffer.
            rows = [];
          }).then(next);
        }
      } else {
        skipped++;
      }
      return Promise.resolve().then(next);
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