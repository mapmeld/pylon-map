// index.js for Pylon-Map
// open source, MIT license

var fs = require('fs');
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
var SystemMap = function(lines) {
  this.lines = lines;
  
  // set unique stops
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

SystemMap.prototype = {
  getStops: function() {
    return this.stops;
  },
  
  getOutgoingLines: function(stop, platformId) {
    var outgoingLines = [];
    for (var l = 0; l < this.lines.length; l++) {
      var line = this.lines[l];
      if (stop.lines.indexOf(line.name) === -1) {
        // this line does not visit the stop
        continue;
      }
      var futureStops = [];
      var tracking = false;
      for (var s = 0; s < line.stops.length; s++) {
        if (tracking) {
          futureStops.push(line.stops[s]);
        }
        if (!tracking && (line.stops[s].name === stop.name)) {
          // reached stop -- does it visit this platform?
          if (line.stops[s].platforms.indexOf(platformId) > -1) {
            tracking = true;
          } else {
            break;
          }
        }
      }
      if (futureStops.length) {
        outgoingLines.push(futureStops);
      }
    }
    return outgoingLines;
  },
  
  getCommonStops: function(outgoingLines) {
    var commonStops;
    if (outgoingLines.length === 1) {
      // only one line... so easy
      commonStops = outgoingLines[0];
    } else {
      // add until you find divergence
      commonStops = [];
      for (var s = 0; s < outgoingLines[0].length; s++) {
        var diverged = false;
        for (var l = 1; l < outgoingLines.length; l++) {
          if (outgoingLines[l][s].name !== outgoingLines[0][s].name) {
            diverged = true;
            break;
          }
        }
        if (!diverged) {
          commonStops.push(outgoingLines[0][s]);
        } else {
          break;
        }
      }
    }
    return commonStops;
  },
  
  drawStop: function(x, color, name, filled) {
    if (!this.ctx) {
      throw 'canvas was not initialized';
    }

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, 100, 30, 0, 2 * Math.PI, true);
    this.ctx.closePath();
    
    if (!filled) {
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.fillStyle = '#fff';
      this.ctx.arc(x, 100, 18, 0, 2 * Math.PI, false);
      this.ctx.closePath();
    }
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = '#000';
    var nameWidth = this.ctx.measureText(name).width;
    this.ctx.fillText(name, x - Math.round(nameWidth / 2), 40);
    this.ctx.closePath();
    this.ctx.fill();
  },
  
  connectCircles: function(x1, x2, color) {
    if (!this.ctx) {
      throw 'canvas was not initialized';
    }
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(x1 + 25, 100);
    this.ctx.lineTo(x2 + 10, 100);
    this.ctx.closePath();
    this.ctx.stroke();
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
    var outgoingLines = this.getOutgoingLines(stop, platformId);
    
    if (!outgoingLines.length) {
      return callback('there are no trains departing from this platform');
    }
    
    // how far can you go before outgoing lines diverge?
    var commonStops = this.getCommonStops(outgoingLines);
    
    // create the canvas
    var canv = new Canvas((commonStops.length + 1) * 100, 200);
    this.ctx = canv.getContext('2d');
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, (commonStops.length + 1) * 100, 200);
    this.ctx.fill();
    
    this.drawStop(50, 'orange', stop.name, true);
    
    for (var s = 0; s < commonStops.length; s++) {
      this.connectCircles(50 + s * 100, 150 + s * 100, 'orange');
      this.drawStop(150 + s * 100, 'orange', commonStops[s].name);
    }
    
    var output = fs.createWriteStream(saveFile);
    canv.pngStream()
      .on('data', function(chunk){
        output.write(chunk);
      })
      .on('end', function(){
        console.log('completed output');
      });
  }
};

module.exports = SystemMap;