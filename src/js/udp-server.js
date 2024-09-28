const { config } = require('./config');
const dgram = require('node:dgram');
const bsplit = require('buffer-split');
const { saveTallyMessage } = require('./TallyLogService');

let udpServer = null;

function closeUDP(){
  udpServer.close();
}

function setupUDP() {
  // console.log('udp-server.js: Setting up UDP server')

  udpServer = dgram.createSocket('udp4');

  udpServer.on('message', (data) => {
    // console.log(data);
    const delim = Buffer.from([0xfe, 0x02]);
    const spl_data = bsplit(data, delim);
    spl_data.forEach((dataPiece) => {
      if (dataPiece.length > 0) {
        saveTallyMessage(dataPiece, protocol='udpData');
      }
    });
  });

  udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`UDP server listening ${address.address}:${address.port}`);

  });

  udpServer.bind(config.ports.listenPort);
}

module.exports = { setupUDP, closeUDP };
