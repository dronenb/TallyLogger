const { config } = require('../config');
const dgram = require('node:dgram');
const bsplit = require('buffer-split');
const { parse } = require('./tally-timer');

function setupUDP() {
  console.log('setting up udp server')

  global.udpServer = dgram.createSocket('udp4');

  udpServer.on('message', (data) => {
    // console.log(data);
    const delim = Buffer.from([0xfe, 0x02]);
    const spl_data = bsplit(data, delim);
    spl_data.forEach((dataPiece) => {
      if (dataPiece.length > 0) {
        parse(dataPiece, protocol='udpData');
      }
    });
  });

  udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`UDP server listening ${address.address}:${address.port}`);
    console.log(`from - ${new Date().toLocaleString()}`);
    console.log('\n\nPress Control+ P to output AAF and - RESET - the Tally capture\n\nControl+ O will - NOT - reset the Tally capture\n\nControl+ C to output AAF and - EXIT - script (e.g., at the end of the night)\n\n');

  });

  udpServer.bind(config.ports.listenPort);
}

module.exports = { setupUDP };
