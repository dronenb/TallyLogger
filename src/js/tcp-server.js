const { config } = require('./config');
const net = require('net');
const bsplit = require('buffer-split');
const { saveTallyMessage } = require('./TallyLogService');
var tcpServer = null;

function closeTCP(){
  tcpServer.close();
}

function setupTCP() {
  // console.log('tcp-server.js setupTCP function: Setting up tcp server')
  tcpServer = net.createServer((socket) => {
    socket.on('data', (data) => {
      const delim = Buffer.from([0xfe, 0x02]);
      const spl_data = bsplit(data, delim);
      spl_data.forEach((dataPiece) => {
        if (dataPiece.length > 0) {
          saveTallyMessage(dataPiece, 'tcpData');
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
  });
}

module.exports = { setupTCP, closeTCP };
