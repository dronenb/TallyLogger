// http-server.js
// This module sets up and configures an HTTP server using Express for handling API requests and serving static content.
// It includes routes for interacting with a SQLite database via Prisma, handling frame rate settings, managing tally logs, 
// and controlling UDP and TCP listeners. It also provides endpoints for updating tape metadata, fetching logs, and color management.

const { config, express, app, io, frameRate } = require('../config'); // Imports configuration, Express app, and other shared objects
const { setupUDP, closeUDP } = require('./udp-server'); // Functions to manage UDP server
const { setupTCP, closeTCP } = require('./tcp-server'); // Functions to manage TCP server
const { PrismaClient } = require('@prisma/client'); // Prisma ORM client for database interaction
const prisma = new PrismaClient(); // Initialize Prisma client instance
const { getTallyEvents } = require('./TallyLogService'); // Function to retrieve tally log events
const { timedOutput } = require('./timer.js'); // Timed output function for processing log events


// Function to set up and initialize the HTTP server
function setupHTTP() {
  console.log('http-server.js: Setting up HTTP')
  // Middleware setup for serving static files, parsing URL-encoded and JSON bodies
  app.use(express.static('public')); // Serve static files from the 'public' directory
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
  app.use(express.json()); // Parse JSON request bodies

  // --- API Routes ---

  // GET /api/tape-data: Fetches tape data from the database using Prisma
  app.get('/api/tape-data', async (req, res) => {
    try {
      const tapeData = await prisma.source.findMany(); // Fetches all records from the 'source' table
      res.json(tapeData);
    } catch (error) {
      console.error('Failed to fetch tape data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /update-tape-name: Updates the tape name in the database
  app.post('/update-tape-name', async (req, res) => {
    const { id, tapeName } = req.body;
    try {
      const updatedRow = await prisma.source.update({
        where: { id: parseInt(id) }, // Find the record by ID and update the tape name
        data: { tapeName: tapeName },
      });
      res.json({ message: 'Update successful', updatedRow });
    } catch (error) {
      res.status(500).json({ message: 'Update failed', error: error.message });
    }
  });


  // GET /api/framerate: Returns the current frame rate
  app.get('/api/framerate', (req, res) => {
    res.json({ frameRate: frameRate }); // Respond with the frameRate from the config
  });

  // POST /api/framerate: Updates the frame rate
  app.post('/api/framerate', (req, res) => {
    const newFrameRate = req.body.frameRate;
    if (newFrameRate) {
      let frameRate = newFrameRate === 23.98 ? 23.976 : newFrameRate; // Convert 23.98 to 23.976
      if (config.ALLOWED_FRAME_RATES.includes(frameRate)) {
        res.json({ message: 'FrameRate updated successfully', frameRate });
      } else {
        res.status(400).json({ error: 'Invalid frame rate. Allowed values: ' + allowedFrameRates.join(', ') });
      }
    } else {
      res.status(400).json({ error: 'No frame rate provided' });
    }
  });

  // GET /fetchLogs: Fetches all tally logs from the database
  app.get('/fetchLogs', (req, res) => {
    const query = `SELECT strftime('%H:%M:%f',tally_time) AS formatted_time, tally_source, tape_name, color_name, color_rgb FROM fake_events ORDER BY tally_time DESC`;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json(rows); // Return the logs in JSON format
    });
  });

  // Get all sources
  app.get('/api/sources', async (req, res) => {
    const sources = await prisma.source.findMany();
    res.json(sources);
  });

  // Create or update a source
  app.post('/api/source', async (req, res) => {
    const { id, label, tapeName, clipColorName, clipColorRGB, clipColorPP } = req.body;
    
    const source = await prisma.source.upsert({
        where: { id: id || 0 }, // If id is provided, update the source
        update: { label, tapeName, clipColorName, clipColorRGB, clipColorPP },
        create: { label, tapeName, clipColorName, clipColorRGB, clipColorPP },
    });

    res.json(source);
  });

  // Delete a source by id
  app.delete('/api/source/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.source.delete({ where: { id: parseInt(id) } });
    res.sendStatus(204); // Success with no content
  });


  // --- Button API Logic ---

  // Helper function to start/stop UDP and TCP servers
  function manageServerState(type, isEnabled) {
    let setupFn, closeFn;
    if (type === 'udp') {
      setupFn = setupUDP;
      closeFn = closeUDP;
    } else if (type === 'tcp') {
      setupFn = setupTCP;
      closeFn = closeTCP;
    }

    if (isEnabled) {
      console.log(`Starting ${type.toUpperCase()} server on port ${config.ports.listenPort}`);
      setupFn(io, config.ports.listenPort);
      return `${type.toUpperCase()} started on port ${config.ports.listenPort}`;
    } else {
      console.log(`Stopping ${type.toUpperCase()} server`);
      closeFn();
      return `${type.toUpperCase()} server stopped`;
    }
  }
  
  // Initialize server states at startup based on config
  if (config.enableTCP) {
    manageServerState('tcp', config.enableTCP); // Start TCP server if enabled
  }
  if (config.enableUDP) {
    manageServerState('udp', config.enableUDP); // Start UDP server if enabled
  }

  // POST /api/button-states: Updates button states for TCP/UDP servers and manages their state
  app.post('/api/button-states', (req, res) => {
    const { udpEnabled, tcpEnabled } = req.body;

    // Validate input: should be boolean values
    if (typeof udpEnabled !== 'boolean' || typeof tcpEnabled !== 'boolean') {
      return res.status(400).json({ error: 'Invalid input. Expected boolean values for udpEnabled and tcpEnabled.' });
    }

    // Update config and manage server state
    config.enableUDP = udpEnabled;
    config.enableTCP = tcpEnabled;
    const udpStatus = manageServerState('udp', udpEnabled);
    const tcpStatus = manageServerState('tcp', tcpEnabled);

    res.json({
      message: 'Button states updated successfully',
      udpStatus,
      tcpStatus
    });
  });

  
  // GET /api/button-states: Returns the current button states (UDP and TCP)
  app.get('/api/button-states', (req, res) => {
    res.json({
      udpEnabled: config.enableUDP,
      tcpEnabled: config.enableTCP,
    });
  });

  // --- Tally Event Logging ---

  // POST /tally: Handles various tally-related button actions
  app.route('/tally')
    .post(function (req, res) {
      const serverResponse = { status: '' };
      const btn = req.body.id, val = req.body.val, startTime = req.body.logStartTime, endTime = req.body.logEndTime;

      if (btn == "btn1") {
        // Handle Tally Logging Start/Stop
        serverResponse.status = val === 'on' ? 'Restarted the Tally Logging.' : 'Stopped the tally logging';
        res.send(serverResponse);
      }
      if (btn == "btn2") {
        // Output log without resetting
        getTallyEvents(startTime, endTime)
          .then(data => timedOutput(false, false, data))
          .catch(error => console.error('Failed to fetch events:', error));
        serverResponse.status = 'Output.';
        res.send(serverResponse);
      }
      if (btn == "btn3") {
        // Output log and reset
        getTallyEvents(startTime, endTime)
          .then(data => timedOutput(true, false, data))
          .catch(error => console.error('Failed to fetch events:', error));
        serverResponse.status = 'Reset.';
        res.send(serverResponse);
      }
      if (btn == "btn4") {
        // Toggle UDP server on/off
        if (val == 'udp-on') {
          setupUDP(io, config.ports.listenPort);
          serverResponse.status = `UDP started on ${config.ports.listenPort}`;
        } else {
          closeUDP();
        }
        res.send(serverResponse);
      }
      if (btn == "btn5") {
        // Toggle TCP server on/off
        if (val == 'tcp-on') {
          setupTCP();
          serverResponse.status = `TCP started on ${config.ports.listenIP}:${config.ports.listenPort}`;
        } else {
          closeTCP();
        }
        res.send(serverResponse);
      }
    });

 // --- Color Management ---

  // Router for handling color dropdown and updates

  const router = express.Router();

  // GET /api/colors: Fetches available color options from the database
  router.get('/api/colors', async (req, res) => {
    try {
      const colors = await prisma.color.findMany({
        select: { name: true }, // Fetch only color names
      });
      res.json(colors);
    } catch (error) {
      console.error('Failed to fetch colors:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


 // POST /api/update-color: Updates the color associated with a tape
 router.post('/api/update-color', async (req, res) => {
  const { id, newColor } = req.body;
  const NumericId = Number(id);
  if (!id || !newColor
  ) {
    return res.status(400).json({ error: 'Missing required fields: id and newColor' });
  }

  try {
    const updatedTape = await prisma.source.update({
      where: { id: NumericId }, // Update the tape record with the new color
      data: { clipColorPP: newColor },
    });
    res.json({ message: 'Color updated successfully', updatedTape });
  } catch (error) {
    console.error('Failed to update color:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  // Register color routes with the main app
  app.use(router);

  // --- Error Handling ---

  // Global error handler for catching unhandled errors and returning a 500 response
  app.use((err, req, res, next) => {
    console.error('Internal server error:', err.stack);
    res.status(500).send('Something broke!');
  });

  // Optional: Handle WebSocket connections via `io`
  io.on('connection', (socket) => {
    console.log('A client connected via WebSocket');
    socket.on('updateSource', async (sourceData) => {
      await saveSource(sourceData); // Save to database
      io.emit('sourceUpdated', sourceData); // Broadcast to all clients
  });

    // Handle WebSocket disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
}

// Export the setup function so it can be used in the main server file
module.exports = { setupHTTP };