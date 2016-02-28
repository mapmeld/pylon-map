// sfo.js
// San Francisco Bay Area use of PylonMap
// open source, MIT license

var SystemMap = require('./index.js');
var lines = require('./data/sfo.json');

var pm = new SystemMap(lines);
pm.saveMap('Downtown Berkeley', 1, './el-cerr-1.png', function (err, data) {
  console.log(data);
});