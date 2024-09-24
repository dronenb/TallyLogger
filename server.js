// TallyLogger server.js
// This is the main entry point for the TallyLogger system, responsible for setting up the HTTP server, 
// WebSocket connections, and event-driven architecture to handle tally logging.
// It integrates global configuration from config.js, loads tape name data, manages timed events, 
// and listens for client connections to interact with UDP/TCP listeners and web-based tally control.

const { config, opener, htmlServer, io, msToTimecode, msSinceMidnight, frameRate } = require('./config');

// Use `config` object to access configurations
// console.log("config.ports: ", config.ports);
// console.log("config.paths: ", config.paths);

// Key-Events (for terminal interaction, less used now due to HTTP web GUI)
const { setupKeyEvents } = require('./helpers/key-events');

// HTTP Server setup for serving the web GUI and handling requests
const { setupHTTP } = require('./helpers/http-server');

// Prisma setup for managing tape name data in the database
const { setupTapeNamePrisma } = require('./helpers/TallyLogService')
// const { parseCSVFile, tapeNameData } = require('./helpers/csv-parser');

// Timer and logging utilities for handling timeouts and events
const { setTimer, timedOutput } = require('./helpers/timer');

// Initialize tape name data using Prisma
setupTapeNamePrisma();

// Set the initial timer for timed events
setTimer();

// Setup the HTTP server and listen on the configured port
setupHTTP();
htmlServer.listen(config.ports.htmlPort, () => {
  console.log(`HTTP Server listening on port ${config.ports.htmlPort}`);
});

let clientConnected = false;

io.on('connection', (socket) => {
  clientConnected = true;
  // Emit initial connection messages to the client
  socket.emit('udpData-start', { TIMECODE: msToTimecode(msSinceMidnight(), frameRate), TEXT: 'TALLY-LOG CONNECTED to UDP via HTTP' });
  socket.emit('tcpData-start', { TIMECODE: msToTimecode(msSinceMidnight(), frameRate), TEXT: 'TALLY-LOG CONNECTED to TCP via HTTP' });

});

// Wait for a client to connect or timeout
let waitForClientOrTimeout = new Promise((resolve, reject) => {
  const timeout = 3000; // Timeout for client to connect
  let timeoutId = setTimeout(() => {
    if (!clientConnected) {
      resolve('Timeout with no client connection');
    }
  }, timeout);

  io.on('connection', () => {
    clearTimeout(timeoutId); // Cancel the timeout if a client connects
    resolve('Client connected');
  });
}); // end promise

// Open the browser to the web UI if no client connects in time
waitForClientOrTimeout.then((message) => {
  if (htmlServer.listening && !clientConnected)  {
        opener(`http://localhost:${config.ports.htmlPort}`);
      }
    });

// Set up key events (for legacy terminal control)
setupKeyEvents(process.stdin, io, msSinceMidnight, frameRate, timedOutput);

// Resume stdin to allow key event detection
process.stdin.setRawMode(true);
process.stdin.resume();
