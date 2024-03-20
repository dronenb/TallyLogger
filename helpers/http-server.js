const { config, express, bodyParser, app, htmlServer, io, msToTimecode } = require('../config');
const { setupUDP } = require('./udp-server');
const { setupTCP } = require('./tcp-server');

function setupHTTP(app, bodyParser, io, msSinceMidnight, frameRate, timedOutput) {
    app.use(express.static('public')); // Serve static files from public directory

	  app.use(bodyParser.urlencoded({ extended: true })); // must come before routing
    app.use(bodyParser.json()); // this handles any JSON bodies

    // Endpoint to get the current frameRate
    app.get('/api/framerate', (req, res) => {
      res.json({ frameRate: global.frameRate });
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
          res.status(500).json({error: "Internal server error"});
          return;
        }
        // console.log(rows);
        res.json(rows); // Then dealt with by client.js AJAX
      });
    });
   
    // THis is the code to handle buttons from the HTML page  
  
    app.route('/tally') //used to unite all the requst types for the same route
      .post(function (req, res) { //handles incoming POST requests
          var serverResponse = {status:''};
          var btn = req.body.id, val = req.body.val; // get the button id and value
          if(btn == "btn1"){ 
            if(val == 'on'){ //if button is clicked
              // console.log('Client request to start the tally logging');
              serverResponse.status = 'Currnently not working yet....Restarted the Tally Logging.';
              res.send(serverResponse); //send response to the server
            }
            else{ //if button is unclicked, turn off the leds
              // console.log('Client request to stop the tally logging');
              serverResponse.status = 'Currnently not working yet.... Stopped the tally logging';
              res.send(serverResponse); //send response to the server
            }
          }
          if(btn == "btn2")	{
            console.log('Client request to output only');
            console.log('\n\nINFO: writing AAF/AVB/OTIO files -- WITHOUT resetting -- tallyLog\n\n')
            timedOutput(reset = false);					
            serverResponse.status = 'Output.';
            res.send(serverResponse); //send response to the server
          }
          if(btn == "btn3")	{
            console.log('Client request to output and reset');
            console.log('\n\nINFO: writing AAF/AVB/OTIO files and -- RESETTING -- tallyLog\n\n')
            // this is for AAF write at current point and reset
            let lastElement = timedOutput(reset = true);
            serverResponse.status = 'Reset.';
            res.send(serverResponse); //send response to the server
          }          
          if(btn == "btn4")	{ // UDP BUTTON
            if(val == 'udp-on') {
              console.log('Client request to start UDP server/listener');
              // ... UDP server setup ...
              serverResponse.status = `UDP starting... on ${config.ports.listenPort}`;
              setupUDP(io, config.ports.listenPort);
              serverResponse.status = `UDP started... on ${config.ports.listenPort}`;
              res.send(serverResponse); //send response to the server
            }
            else {
              udpServer.close();
              console.log('UDP port closed');
            }
          }
          if(btn == "btn5")	{ // TCP BUTTON
            if(val == 'tcp-on') {
              console.log('Client request to start TCP server/listener');
              // ... TCP server setup ...
              serverResponse.status = `TCP starting... on ${config.ports.listenIP}:${config.ports.listenPort}`;
              // ... TCP server setup ...
              setupTCP();
              serverResponse.status = `TCP started... on ${config.ports.listenIP}:${config.ports.listenPort}`;
              res.send(serverResponse); //send response to the server
            }
            else {
              tcpServer.close();
              console.log('TCP port closed');
            }
          }
      });
  }
  
  module.exports = { setupHTTP };
  