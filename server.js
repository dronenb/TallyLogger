const { config, opener, bodyParser, app, htmlServer, io, msToTimecode } = require('./config');
global.frameRate = 50;
// Use `config` object to access configurations
console.log(config.ports.htmlPort);

const fs = require('fs');
const jspack = require('jspack').jspack;

const { setupKeyEvents } = require('./helpers/key-events');
const { setupHTTP } = require('./helpers/http-server');
const { setupTapeNameSQL, setupEventSQL, setupFakePGM, emptyEventSQL } = require('./helpers/sqlite');
const { parseCSVFile, tapeNameData } = require('./helpers/csv-parser');
const { Index, parse, msSinceMidnight } = require('./helpers/tally-timer');
const { setTimer, resetTimer, timedOutput } = require('./helpers/timer');
const tallyLogManager = require('./helpers/tallyLogManager');

// ... Other constant definitions ...

// Find out where this is used
global.logStartTime = new Date().toISOString();

// This is where events are stored to pass to AAF
// TODO - change to database?
const now = msSinceMidnight();
tallyLogManager.setStartTime(now);
tallyLogManager.setEndTime(now);
tallyLogManager.clearClips();

// ... Timer setup ...
console.log('initially setting the timeout timer')
setTimer();

// ... HTTP server setup ...
console.log('setting up HTTP server')
setupHTTP(app, bodyParser, io, msSinceMidnight, frameRate, timedOutput);

// start listening on the HTTP port
console.log ('setup listen on HTML Port')
htmlServer.listen(config.ports.htmlPort, () => {
  console.log(`HTTP Server listening on port ${config.ports.htmlPort}`);
});

let clientConnected = false;

io.on('connection', (socket) => {
  console.log('HTTP Client connected');
  clientConnected = true;
  // Emit the initial message immediately upon a client's connection
  socket.emit('udpData-start', { TIMECODE: msToTimecode(msSinceMidnight(), frameRate), TEXT: 'TALLY-LOG CONNECTED to UDP via HTTP' });
  socket.emit('tcpData-start', { TIMECODE: msToTimecode(msSinceMidnight(), frameRate), TEXT: 'TALLY-LOG CONNECTED to TCP via HTTP' });

});

let waitForClientOrTimeout = new Promise((resolve, reject) => {
  console.log('waiting for HTTP Client to connect')
  const timeout = 3000; // Timeout for client to connect

  let timeoutId = setTimeout(() => {
    if (!clientConnected) {
      console.log('No HTTP client connected within timeout period');
      resolve('Timeout with no client connection');
    }
  }, timeout);

  io.on('connection', () => {
    clearTimeout(timeoutId); // Cancel the timeout if a client connects
    resolve('Client connected');
  });
}); // end promise

waitForClientOrTimeout.then((message) => {
  console.log(`outcome: ${message}`); // log the outcome

  // check server listening and client connections status
  if (htmlServer.listening && !clientConnected)  {
        // opens the url in the default browser 
        opener(`http://localhost:${config.ports.htmlPort}`);
      }
    });


// Key event setup
console.log('setting up Key Events')
setupKeyEvents(process.stdin, io, msSinceMidnight, frameRate, timedOutput);


// setup Tape Name LUT SQLite3 database
console.log('setting up TapeNameSQL')
setupTapeNameSQL();

console.log('setting up EventSQL')
// setup Tally Event SQLite3 database
setupEventSQL();

// setup Fake Event - normally commented out
// setupFakePGM();

// ... CSV parsing ...
// TODO - make a database?
console.log('parsing CSV data')
global.tapeNameData =[];
parseCSVFile(config.tapeNameFilePath);

// ... Python script execution functions ...

// ... Color mapping ...



process.stdin.setRawMode(true);
process.stdin.resume();
