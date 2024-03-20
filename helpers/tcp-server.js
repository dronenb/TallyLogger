const { config, express, bodyParser, app, htmlServer, io, msToTimecode } = require('../config');
const net = require('net');
const bsplit = require('buffer-split');
const { parse } = require('./tally-timer');

function setupTCP() {
  console.log('setting up tcp server')
  global.tcpServer = net.createServer((socket) => {
    socket.on('data', (data) => {
      const delim = Buffer.from([0xfe, 0x02]);
      const spl_data = bsplit(data, delim);
      spl_data.forEach((dataPiece) => {
        if (dataPiece.length > 0) {
          parse(dataPiece, 'tcpData');
        }
      });
    });

    socket.on('close', () => {
      // Handle connection closed
    });

    socket.on('error', (err) => {
      console.error(`Error: ${err}`);
    });
  });

  tcpServer.listen(config.ports.listenPort, config.ports.listenIP, () => {
    console.log(`TCP Server listening on - ${config.ports.listenIP}:${config.ports.listenPort}`);
    // console.log(`from - ${new Date().toLocaleString()}`);
    console.log('\n\nPress Control+ P to output AAF and - RESET - the Tally capture\n\nControl+ O will - NOT - reset the Tally capture\n\nControl+ C to output AAF and - EXIT - script (e.g., at the end of the night)\n\n');
  });
}

module.exports = { setupTCP };
