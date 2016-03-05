// sfo.js
// San Francisco Bay Area use of PylonMap
// open source, MIT license

var SystemMap = require('./index.js');
var lines = require('./data/sfo.json');

var pm = new SystemMap(lines);


// inbound - representing transfers
pm.saveMap('Downtown Berkeley', 1, './berkeley-1.png', function (err, data) {
  console.log(data);
});

// outbound - no transfers
/*
pm.saveMap('Downtown Berkeley', 2, './berkeley-2.png', function (err, data) {
  console.log(data);
});
*/
