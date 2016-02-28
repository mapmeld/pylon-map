// index.js for Pylon-Map
// open source, MIT license

var Canvas = require('canvas');

// individual stop
var Stop = function(name, platforms) {
  this.name = name;
  this.platforms = platforms;
  this.lines = [];
  return this;
};
Stop.prototype = {
};

// system map
var PylonMap = function(lines) {
  this.lines = lines;
  
  // set unique stations
  var knownNames = [];
  this.stops = [];
  for (var l = 0; l < lines.length; l++) {
    var line = lines[l];
    for (var s = 0; s < line.stops.length; s++) {
      var name = line.stops[s].name;
      var platforms = line.stops[s].platforms;
      if (knownNames.indexOf(name) === -1) {
        // new stop
        knownNames.push(name);
        var stop = new Stop(name, platforms);
        stop.lines.push(line.name);
        this.stops.push(stop);
      } else {
        // update stop data
        for(var x = 0; x < this.stops.length; x++) {
          if (this.stops[x].name === name) {
            // record line
            this.stops[x].lines.push(line.name);
            
            // make sure all platforms are stored
            for (var p = 0; p < platforms.length; p++) {
              if (this.stops[x].platforms.indexOf(platforms[p]) === -1) {
                this.stops[x].platforms.push(platforms[p]);
              }
            }
            break;
          }
        }
      }
    }
  }
  return this;
};

PylonMap.prototype = {
  getStops: function() {
    return this.stops;
  },
  
  saveMap: function(name, platformId, saveFile, callback) {
    if (!callback) {
      callback = console.error;
    }
    
    // retrieve stop and platform
    var stop = null;
    name = name.toLowerCase().replace(/\s/g, '');
    for(var x = 0; x < this.stops.length; x++) {
      if (this.stops[x].name.toLowerCase().replace(/\s/g, '') === name) {
        stop = this.stops[x];
        break;
      }
    }
    if (!stop) {
      return callback('that stop name does not exist');
    }
    if (stop.platforms.indexOf(platformId) === -1) {
      return callback('that platform-ID does not exist');
    }
    
    // extract all future stops
    var outgoingLines = [];
    for (var l = 0; l < this.lines.length; l++) {
      var line = this.lines[l];
      if (stop.lines.indexOf(line.name) === -1) {
        // this line does not visit the station
        continue;
      }
      var futureStations = [];
      var tracking = false;
      for (var s = 0; s < line.stops.length; s++) {
        if (tracking) {
          futureStations.push(line.stops[s]);
        }
        if (!tracking && (line.stops[s].name === stop.name)) {
          // reached station -- does it visit this platform?
          if (line.stops[s].platforms.indexOf(platformId) > -1) {
            tracking = true;
          } else {
            break;
          }
        }
      }
      if (futureStations.length) {
        outgoingLines.push(futureStations);
      }
    }
    
    if (!outgoingLines.length) {
      return callback('there are no trains departing from this platform');
    }
    
    // how far can you go before outgoing lines diverge?
    var commonStations = [];
    if (outgoingLines.length === 1) {
      // only one line... so easy
      commonStations = outgoingLines[0];
    } else {
      for (var s = 0; s < outgoingLines[0].length; s++) {
        var diverged = false;
        for (var l = 1; l < outgoingLines.length; l++) {
          if (outgoingLines[l][s].name !== outgoingLines[0][s].name) {
            diverged = true;
            break;
          }
        }
        if (!diverged) {
          commonStations.push(outgoingLines[0][s]);
        } else {
          break;
        }
      }
    }
    
    callback(null, commonStations);
  }
};

module.exports = PylonMap;