# pylon-map

Generate platform-specific subway maps in NodeJS

Inspired by Washington DC Metro

And lack of such signs on BART

## Installation

Node-Canvas requires cairo to be installed... use a special buildpack on Heroku
and other PaaS sites.

## Usage

Pass in a list of lines and platforms which they arrive on:

```javascript
var PylonMap = require('pylon-map');
var lines = [
  {
    name: "Richmond-Millbrae",
    alwaysRunning: false,
    stops: [
      {
        name: "Richmond",
        platforms: [1]
      }
      ...
    ]
  }
];
var systemMap = new PylonMap(lines);

var stations = systemMap.getStops();
> [Object]

stations[0].name
> 'Richmond'

stations[0].platforms
> [1, 2]

stations[0].lines
> ['Richmond-Millbrae', 'Richmond-Fremont', 'Millbrae-Richmond', 'Fremont-Richmond']

systemMap.saveMap('Richmond', 1, 'richmond-1.png', function(err) { ... });
```

## License

Open source, MIT license