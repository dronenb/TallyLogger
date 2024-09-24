// TallyLogger server.js

const { config, opener, htmlServer, io, msToTimecode, msSinceMidnight, frameRate } = require('./config');

// Use `config` object to access configurations
// console.log(config.ports.htmlPort);

const { setupKeyEvents } = require('./helpers/key-events');
const { setupHTTP } = require('./helpers/http-server');
const { setupTapeNamePrisma } = require('./helpers/TallyLogService')
const { parseCSVFile, tapeNameData } = require('./helpers/csv-parser');
const { setTimer, timedOutput } = require('./helpers/timer');


// ... Other constant definitions ...


// load the tapename csv
// console.log('setting up tape name PRISMA::::::::');
setupTapeNamePrisma();
// ... Timer setup ...
// console.log('initially setting the timeout timer')
setTimer();

// ... HTTP server setup ...
// console.log('setting up HTTP server')
setupHTTP();

// start listening on the HTTP port
// console.log ('setup listen on HTML Port')
htmlServer.listen(config.ports.htmlPort, () => {
  console.log(`HTTP Server listening on port ${config.ports.htmlPort}`);
});

let clientConnected = false;

io.on('connection', (socket) => {
  // console.log('HTTP Client connected');
  clientConnected = true;
  // Emit the initial message immediately upon a client's connection
  socket.emit('udpData-start', { TIMECODE: msToTimecode(msSinceMidnight(), frameRate), TEXT: 'TALLY-LOG CONNECTED to UDP via HTTP' });
  socket.emit('tcpData-start', { TIMECODE: msToTimecode(msSinceMidnight(), frameRate), TEXT: 'TALLY-LOG CONNECTED to TCP via HTTP' });

});

let waitForClientOrTimeout = new Promise((resolve, reject) => {
  // console.log('waiting for HTTP Client to connect')
  const timeout = 3000; // Timeout for client to connect

  let timeoutId = setTimeout(() => {
    if (!clientConnected) {
      // console.log('No HTTP client connected within timeout period');
      resolve('Timeout with no client connection');
    }
  }, timeout);

  io.on('connection', () => {
    clearTimeout(timeoutId); // Cancel the timeout if a client connects
    resolve('Client connected');
  });
}); // end promise

waitForClientOrTimeout.then((message) => {
  // console.log(`outcome: ${message}`); // log the outcome

  // check server listening and client connections status
  if (htmlServer.listening && !clientConnected)  {
        // opens the url in the default browser 
        opener(`http://localhost:${config.ports.htmlPort}`);
      }
    });


// Key event setup
// console.log('setting up Key Events')
setupKeyEvents(process.stdin, io, msSinceMidnight, frameRate, timedOutput);


process.stdin.setRawMode(true);
process.stdin.resume();
