// http-server.js
// This module sets up and configures an HTTP server using Express for handling API requests and serving static content.
// It includes routes for interacting with a SQLite database via Prisma, handling frame rate settings, managing tally logs, 
// and controlling UDP and TCP listeners. It also provides endpoints for updating tape metadata, fetching logs, and color management.

const { config, express, app, io, frameRate } = require('../config');
const { setupUDP, closeUDP } = require('./udp-server');
const { setupTCP, closeTCP } = require('./tcp-server');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
});
const { getTallyEvents } = require('./TallyLogService');
const { timedOutput } = require('./timer.js')

function setupHTTP() {
  // console.log('SetupHTTP Initial Config:', config); //Debug


  app.use(express.static('public')); // Serve static files from public directory
  app.use(express.urlencoded({ extended: true })); // must come before routing
  app.use(express.json()); // Handles JSON bodies

  // API end points...
  app.get('/api/tape-data', async (req, res) => {
    try {
      const tapeData = await prisma.source.findMany(); // Use the correct model name
      res.json(tapeData);
    } catch (error) {
      console.error('Failed to fetch tape data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  // update table updates the database
  app.post('/update-tape-name', async (req, res) => {
    const { id, tapeName } = req.body;
    // Input validation here
    try {
      const updatedRow = await prisma.source.update({
        where: { id: parseInt(id) },
        data: { tapeName: tapeName },
      });
      res.json({ message: 'Update successful', updatedRow });
    } catch (error) {
      res.status(500).json({ message: 'Update failed', error: error.message });
    }
  });

  // Endpoint to get the current frameRate
  app.get('/api/framerate', (req, res) => {
    res.json({ frameRate: frameRate });
  });

  // Endpoint to set a new frameRate
  app.post('/api/framerate', (req, res) => {
    const newFrameRate = req.body.frameRate;

    if (newFrameRate) {
      // Correcting 23.98 to 23.976 if provided
      let frameRate = newFrameRate === 23.98 ? 23.976 : newFrameRate;
      
      if (config.ALLOWED_FRAME_RATES.includes(frameRate)) {
        // Proceed to update frameRate in your storage or configuration
        res.json({ message: 'FrameRate updated successfully', frameRate });
      } else {
        // Frame rate is not in the allowed list
        res.status(400).json({ error: 'Invalid frame rate. Allowed values: ' + allowedFrameRates.join(', ') });
      }
    } else {
      // Frame rate was not provided in the request
      res.status(400).json({ error: 'No frame rate provided' });
    }
  });

  // Endpoint to fetch all logs
  app.get('/fetchLogs', (req, res) => {
    const query = `SELECT strftime('%H:%M:%f',tally_time) AS formatted_time, tally_source, tape_name, color_name, color_rgb FROM fake_events ORDER BY tally_time DESC`;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      // console.log(rows);
      res.json(rows); // Then dealt with by client.js AJAX
    });
  });

  // THis is the code to handle buttons from the HTML page  


 // Helper function to manage server states
  function manageServerState(type, isEnabled) {
    console.log(`manageServerState called: type=${type}, isEnabled=${isEnabled}`); //Debug
    let setupFn, closeFn;
    
    if (type === 'udp') {
      setupFn = setupUDP;
      closeFn = closeUDP;
    } else if (type === 'tcp') {
      setupFn = setupTCP;
      closeFn = closeTCP;
    }

    console.log(`---Managing ${type.toUpperCase()} server. Enabled: ${isEnabled}`); //Debug


    if (isEnabled) {
      console.log(`Starting ${type.toUpperCase()} server on port ${config.ports.listenPort}`);
      setupFn(io, config.ports.listenPort); // Adjust parameters as necessary
      return `${type.toUpperCase()} started on port ${config.ports.listenPort}`;
    } else {
      console.log(`Stopping ${type.toUpperCase()} server`);
      closeFn();
      return `${type.toUpperCase()} server stopped`;
    }
  }
  // Set initial state
  if (config.enableTCP) {
    manageServerState('tcp', config.enableTCP);
  }
  if (config.enableUDP) {
    manageServerState('udp', config.enableUDP);
  }
  // Updated button states endpoint
  app.post('/api/button-states', (req, res) => {
    const { udpEnabled, tcpEnabled } = req.body;

    // Validate input
    if (typeof udpEnabled !== 'boolean' || typeof tcpEnabled !== 'boolean') {
      return res.status(400).json({ error: 'Invalid input. Expected boolean values for udpEnabled and tcpEnabled.' });
    }
    // Update config based on the received values
    config.enableUDP = udpEnabled;
    config.enableTCP = tcpEnabled;

    // Manage UDP and TCP servers
    const udpStatus = manageServerState('udp', udpEnabled);
    const tcpStatus = manageServerState('tcp', tcpEnabled);

    // Respond with the updated state
    res.json({
      message: 'Button states updated successfully',
      udpStatus,
      tcpStatus
    });
  });

  // Endpoint to get the current button states (UDP and TCP)
  app.get('/api/button-states', (req, res) => {
    const response = {
      udpEnabled: config.enableUDP,
      tcpEnabled: config.enableTCP,
    };
    console.log('api/button-states response:', response); // debug
    res.json(response);
  });

  app.route('/tally') //used to unite all the requst types for the same route
    .post(function (req, res) { //handles incoming POST requests
  
      var serverResponse = { status: '' };
      // nb logStartTime and logEndTime are DateISOString atm
      var btn = req.body.id, val = req.body.val, startTime = req.body.logStartTime, endTime = req.body.logEndTime;// get the button id and value
      // console.log(`File: ${__filename} - Button state value:`, val);
      if (btn == "btn1") {
        if (val == 'on') { //if button is clicked
          // console.log('Client request to start the tally logging');
          serverResponse.status = 'Currently not working yet....Restarted the Tally Logging.';
          res.send(serverResponse); //send response to the server
        }
        else { //if button is unclicked, turn off the leds
          // console.log('Client request to stop the tally logging');
          serverResponse.status = 'Currently not working yet.... Stopped the tally logging';
          res.send(serverResponse); //send response to the server
        }
      }
      if (btn == "btn2") {
        // console.log('http-server.js Btn2: Client request to output only');
        // console.log('\n\nINFO: writing AAF/AVB/OTIO files -- WITHOUT resetting -- tallyLog\n\n')

        getTallyEvents(startTime, endTime)
          .then(data => { // data.startTime, data.endTime, data.events
            // Process data
            timedOutput(reset = false, timed = false, data = data);

          })
          .catch(error => {
            console.error('Failed to fetch events:', error);
          });
  
        serverResponse.status = 'Output.';
        res.send(serverResponse); //send response to the server
      }
      if (btn == "btn3") {
        // console.log('http-server.js Btn3: Client request to output and reset');
        // console.log('\n\nINFO: writing AAF/AVB/OTIO files and -- RESETTING -- tallyLog\n\n')
        getTallyEvents(startTime, endTime)
          .then(data => {
            // console.log(events);
            // console.log(`Retrieved ${events.length} events.`);
            // Process events
            timedOutput(reset = true, timed = false, data = data);

          })
          .catch(error => {
            console.error('Failed to fetch events:', error);
          });

        serverResponse.status = 'Reset.';
        res.send(serverResponse); //send response to the server
      }
      if (btn == "btn4") { // Button 4 is UDP toggle

        if (val == 'udp-on') {
          // console.log('http-server.js Btn4: Client request to start UDP server/listener');
          // ... UDP server setup ...
          serverResponse.status = `UDP starting... on ${config.ports.listenPort}`;
          setupUDP(io, config.ports.listenPort);
          serverResponse.status = `UDP started... on ${config.ports.listenPort}`;
          res.send(serverResponse); //send response to the server
        }
        else {
          closeUDP();
        }
      }
      if (btn == "btn5") { // TCP BUTTON

        if (val == 'tcp-on') {
          // console.log('http-server.js Btn5: Client request to start TCP server/listener');
          // ... TCP server setup ...
          serverResponse.status = `TCP starting... on ${config.ports.listenIP}:${config.ports.listenPort}`;
          // ... TCP server setup ...
          setupTCP();
          serverResponse.status = `TCP started... on ${config.ports.listenIP}:${config.ports.listenPort}`;
          res.send(serverResponse); //send response to the server
        }
        else {
          closeTCP();
        }
      }
    });

  // handle color drop down for tapename
  // Endpoint to fetch color options
  const router = express.Router();

  router.get('/api/colors', async (req, res) => {
    try {
      const colors = await prisma.color.findMany({
        select: {
          name: true, // Assuming you only need the color names for the dropdown
        },
      });
      res.json(colors);
    } catch (error) {
      console.error('Failed to fetch colors:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

 // update color updates the database
  // Endpoint to update color for a tapeName
  router.post('/api/update-color', async (req, res) => {
    const { id, newColor } = req.body;
    const NumericId = Number(id);
    // Basic validation
    if (!id || !newColor) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {

      // Ensure the new id exists in the database
      const tapeExists = await prisma.source.findUnique({
        where: {
          id: NumericId,
        },
      });
      if (!tapeExists) {
        return res.status(404).json({ message: 'Tape not found' });
      }
      // Ensure the new id exists in the database
      const colorExists = await prisma.color.findUnique({
        where: {
          name: newColor,
        },
      });
      if (!colorExists) {
        return res.status(404).json({ message: 'Color not found' });
      }
      // get the colorRGB from the colors

      // Update the tapeName record
      await prisma.source.update({
        where: { id: NumericId },
        data: {
          clipColorName: newColor,
          // Assume you also want to update clipColorRGB
          clipColorRGB: colorExists.rgb,
        },
      });

      res.json({ message: 'Color updated successfully', clipColorName: newColor, clipColorRGB: colorExists.rgb });
    } catch (error) {
      console.error('Failed to update color:', error);
      // Handle case where tapeName record doesn't exist
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Record not found' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  app.use('/', router);


}

module.exports = { setupHTTP };
