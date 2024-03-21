// config.js
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const opener = require('opener');
const socketIO = require('socket.io');
const msToTimecode = require('ms-to-timecode');
const frameRate = 50;

// Define configurations as an object instead of using global variables
const config = {
    httpConnected: false,
    paths: {
        aafFilePath: JSON.stringify("/Users/trevoraylward/Documents/GitHub/_TallyToAAF/aaf/"),
        avbFilePath: JSON.stringify("/Users/trevoraylward/Documents/Avid Projects/NBC Paris 24/results/"),
        otioFilePath: JSON.stringify("/Users/trevoraylward/Documents/GitHub/_TallyToAAF/otio/")
    },
    ports: {
        htmlPort: 3000,
        listenPort: 9910,
        listenIP: '127.0.0.1'
    },
    tapeNameFilePath: "/Users/trevoraylward/Documents/GitHub/_TallyToAAF/LUT/TallyTapeName.csv",
};

// Initializing Express app and HTTP server here might not be best for a config file.
// You might want to initialize these in the main server file or a dedicated initialization script.
// However, for simplicity, let's keep these here but export them properly.
const app = express();
const htmlServer = http.createServer(app);
const io = socketIO(htmlServer);

function msSinceMidnight(d=null){
	// calculate the number of milliseconds since midnight
	if (d !== null) {
		var e = new Date(d)
	}	
	else{
		var e = new Date()
	}
	return (e.getTime() - e.setHours(0,0,0,0))
}

// Export configurations and modules
module.exports = {
    config,
    express,
    bodyParser,
    app,
    http,
    opener,
    htmlServer,
    io,
    msToTimecode,
    msSinceMidnight,
    frameRate
};