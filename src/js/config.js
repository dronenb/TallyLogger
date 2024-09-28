// config.js
// This file holds the core configuration settings and utility functions used throughout the TallyLogger system.
// It exports the Express app, HTTP server, WebSocket server (Socket.IO), file path configurations, port settings, 
// timecode utilities, and other essential modules needed across different parts of the application.

// External modules
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const opener = require('opener');
const socketIO = require('socket.io');
const Timecode = require('smpte-timecode')

// Express app and HTTP server initialization, though it could be moved elsewhere for better organization
const app = express();            // Express app for handling HTTP requests and static files
const htmlServer = http.createServer(app); // HTTP server created with the Express app
const io = socketIO(htmlServer);  // WebSocket (Socket.IO) server for real-time communication

const msToTimecode = require('ms-to-timecode');
const { exec } = require('child_process'); // For TallyArbiter start


// Frame rate used throughout the system (default: 50fps)
const frameRate = 50;

// Configurations for the system, including paths for exported files, ports for HTTP and UDP/TCP listeners
const config = {
  enableUDP: true,
  enableTCP: false,
  ALLOWED_FRAME_RATES: [23.976, 24, 25, 29.97, 30, 50, 59.94, 60],
  httpConnected: false,
  paths: {
    aafFilePath: JSON.stringify("../../../_TallyLogExports/aaf/"),
    avbFilePath: JSON.stringify("../../../_TallyLogExports/avb/"),
    otioFilePath: JSON.stringify("../../../_TallyLogExports/otio/"),
    xmlFilePath: JSON.stringify("../../../_TallyLogExports/xml/")
  },
  ports: {
    htmlPort: 3000,
    listenPort: 9910,
    listenIP: '127.0.0.1'
  },
};

// Utility functions
// Calculate milliseconds since midnight for a given date (or current time if no date is provided)
function msSinceMidnight(d = null) {
  // calculate the number of milliseconds since midnight
  if (d !== null) {
    var e = new Date(d)
  }
  else {
    var e = new Date()
  }
  return (e.getTime() - e.setHours(0, 0, 0, 0))
}

// Convert timecode (e.g., "00:00:01:00") to a JavaScript Date object, based on frames-per-second (fps)
function timecodeToDatetime(timecode, fps) {
  const t = Timecode(timecode, fps = 25, false);
  var s = t.frameCount / fps;
  return new Date(s * 1000);
}

// Convert a JavaScript Date object to a timecode string based on frames-per-second (fps)
function dateTimeToTimecode(d, fps) {
  const t = Timecode(d, fps = 25, false);
  return t;
}


exec('open /Applications/TallyArbiter.app', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error launching Tally Arbiter: ${err}`);
    return;
  }
  console.log('Tally Arbiter launched successfully');
});

// Export the configuration object and utility modules
module.exports = {
  config,               // Configuration settings
  express,              // Express app for HTTP handling
  app,                  // Express instance
  http,                 // HTTP server module
  opener,               // Module for opening URLs in the default browser
  htmlServer,           // The HTTP server created with the Express app
  io,                   // Socket.IO WebSocket server for real-time communication
  msToTimecode,         // Utility for converting milliseconds to timecode
  msSinceMidnight,      // Function to calculate milliseconds since midnight
  frameRate,            // Frame rate setting for the system (default: 50fps)
  fs,                   // Node.js file system module for file operations
  path,                 // Node.js path module for handling file paths
  timecodeToDatetime,   // Utility function for converting timecode to datetime
  dateTimeToTimecode,   // Utility function for converting datetime to timecode
};
