// sfo.js
// San Francisco Bay Area use of PylonMap
// open source, MIT license

var PylonMap = require('./index.js');
var lines = require('./data/sfo.json');

var pm = new PylonMap(lines);
pm.saveMap('El Cerrito del Norte', 1, '', function (err, data) {
  console.log(data);
});