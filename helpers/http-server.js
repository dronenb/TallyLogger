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
  app.use(express.static('public')); // Serve static files from public directory

  app.use(express.urlencoded({ extended: true })); // must come before routing
  app.use(express.json()); // this handles any JSON bodies

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
    let { frameRate } = req.body;
    if (frameRate === 23.98) {
      frameRate = 23.976; // Correcting to 23.976
    }
    const allowedFrameRates = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];

    if (allowedFrameRates.includes(frameRate)) {
      // Proceed to update frameRate in your storage or configuration
      res.json({ message: 'FrameRate updated successfully', frameRate });
    } else {
      // FrameRate is not allowed, send an error response
      res.status(400).json({ error: 'Invalid frame rate value' });
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

  app.route('/tally') //used to unite all the requst types for the same route
    .post(function (req, res) { //handles incoming POST requests
  
      var serverResponse = { status: '' };
      // nb logStartTime and logEndTime are DateISOString atm
      var btn = req.body.id, val = req.body.val, startTime = req.body.logStartTime, endTime = req.body.logEndTime;// get the button id and value
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
        console.log('Client request to output only');
        console.log('\n\nINFO: writing AAF/AVB/OTIO files -- WITHOUT resetting -- tallyLog\n\n')

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
        console.log('Client request to output and reset');
        console.log('\n\nINFO: writing AAF/AVB/OTIO files and -- RESETTING -- tallyLog\n\n')
        getTallyEvents(startTime, endTime)
          .then(data => {
            // console.log(events);
            // Process events
            // console.log(`Retrieved ${events.length} events.`);
            timedOutput(reset = true, timed = false, data = data);

          })
          .catch(error => {
            console.error('Failed to fetch events:', error);
          });

        serverResponse.status = 'Reset.';
        res.send(serverResponse); //send response to the server
      }
      if (btn == "btn4") { // UDP BUTTON
        if (val == 'udp-on') {
          console.log('Client request to start UDP server/listener');
          // ... UDP server setup ...
          serverResponse.status = `UDP starting... on ${config.ports.listenPort}`;
          setupUDP(io, config.ports.listenPort);
          serverResponse.status = `UDP started... on ${config.ports.listenPort}`;
          res.send(serverResponse); //send response to the server
        }
        else {
          closeUDP();
          console.log('UDP port closed');
        }
      }
      if (btn == "btn5") { // TCP BUTTON
        if (val == 'tcp-on') {
          console.log('Client request to start TCP server/listener');
          // ... TCP server setup ...
          serverResponse.status = `TCP starting... on ${config.ports.listenIP}:${config.ports.listenPort}`;
          // ... TCP server setup ...
          setupTCP();
          serverResponse.status = `TCP started... on ${config.ports.listenIP}:${config.ports.listenPort}`;
          res.send(serverResponse); //send response to the server
        }
        else {
          closeTCP();
          console.log('TCP port closed');
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
