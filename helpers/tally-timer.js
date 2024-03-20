const { io, msToTimecode } = require('../config');
const tallyLogManager = require('./tallyLogManager');
const jspack = require('jspack').jspack;


// all from original tally-timer code
// commented out the bits we don't currenlty use
class Index {
	constructor(tally_obj) {
		this.updateControl(tally_obj);
	}

	updateControl(obj) {
		// unused properties bypassed

		// this.rh_tally = obj.control.rh_tally;
		// this.lh_tally = obj.control.lh_tally;
		// this.text_tally = obj.control.text_tally;
		// this.brightness = obj.control.brightness;
		this.text = obj.TEXT;
		this.time = obj.TIME;
		// this.index = obj.INDEX[0];
	}	
}
// parse function from tally timer
// unused data commented out but kept here in case it is useful in future
var parse = function(data, protocol) { // protocol is udpData tcpData sqlData
	const now = new Date().toISOString();
	if (data.length > 12) {
		// console.log(data);
		tallyObj = {};
		var cursor = 0;
		tallyObj.TIME = msSinceMidnight();
		tallyObj.TIMECODE = msToTimecode(tallyObj.TIME, frameRate)
		//Message Format
		const _PBC = 2 		//2 bytes = 16 bits 
							// Packet Byte Count of following packet
		const _VER = 1 		// VERsion
		const _FLAGS = 1 	// FLAGS (8 bit): Defined as follows:   
							// Bit 0: Clear for ASCII based strings in packet, set for Unicode UTF-16LE  
							// Bit 1: If set, data after SCREEN is screen control data (SCONTROL) 
							// – otherwise  it’s display message data (DMSG) 
							// Bit 2-7: Reserved (clear to 0) 
		const _SCREEN = 2	// Primary index for use where each screen entity would have display indices (defined below) starting from 0. 
							// Index 0xFFFF is reserved as a “Broadcast” to all screens. If not used, set to 0. 
		const _INDEX = 2	// INDEX (16 bit): The 0 based address of the display, up to 65534 (0xFFFE). 
							// Address 0xFFFF is reserved as a “Broadcast” address to all displays. 
		const _CONTROL = 2	// CONTROL (16 bit): Display control and tally data as follows:  
							// Bit 0-1:  RH Tally Lamp state Bit 2-3:  Text Tally state Bit 4-5:  LH Tally Lamp state  Bit 6-7:  Brightness value (range 0-3)  Bit 8-14: Reserved (clear to 0) 
							// Bit 15:  Control Data: following data to be interpreted as Control data rather  than Display data when set to 1.  
							// 2 Bit Tally values are: 0 = OFF, 1 = RED, 2 = GREEN, 3 = AMBER. 
		//Display Data
		const _LENGTH = 2	// Display Data: (CONTROL bit 15 is cleared to 0)  
							// LENGTH (16 bit): Byte count of following text.  
							// TEXT: UMD text, format defined by FLAGS byte.  
							// Control Data: (CONTROL bit 15 is set to 1)  Not defined in this version of protocol. 

		// skipping the unneeded tally entries
		tallyObj.PBC = jspack.Unpack( "<H", data, cursor);
		// console.log('PBC: ' + tallyObj.PBC); // 14 seems to be program
		cursor += _PBC;
		tallyObj.VER = jspack.Unpack( "<B", data, cursor);
		// console.log('VER: ' + tallyObj.VER);
		cursor += _VER;
		tallyObj.FLAGS = jspack.Unpack( "<B", data, cursor);
		// console.log('FLAGS: ' + tallyObj.FLAGS); // 0 seems to be default
		cursor += _FLAGS;
		tallyObj.SCREEN = jspack.Unpack( "<H", data, cursor);
		// console.log('SCREEN: ' + tallyObj.SCREEN); // Screen that tally is sent to
		cursor += _SCREEN;
		tallyObj.INDEX = jspack.Unpack( "<H", data, cursor);
		// console.log('INDEX: ' +tallyObj.INDEX); // Index - can be used for AUX busses??
		cursor += _INDEX;
		tallyObj.CONTROL = jspack.Unpack( "<H", data, cursor);
		// console.log('CONTROL: ' + tallyObj.CONTROL); // 0, 192, 197 - seems to refer to brightness
		cursor += _CONTROL;

		var LENGTH = jspack.Unpack( "<H", data, cursor)
		// console.log(LENGTH); // 4 ?
		cursor += _LENGTH;

		tallyObj.TEXT = jspack.Unpack( "s".repeat(LENGTH), data, cursor);

		if (tallyObj.TEXT != undefined) {
			tallyObj.TEXT = tallyObj.TEXT.join("")
            if (io) {  // Check if io is defined
                io.emit(protocol, tallyObj);
            }
			else{
				console.log('socket.io does not exist')
			}
			tallyLogManager.addClip(tallyObj);

			db.run(`INSERT into tally_events (time, text, pbc, ver, flags, screen, control, indx, msg) VALUES ("${now}", "${tallyObj.TEXT}","${tallyObj.PBC}","${tallyObj.VER}","${tallyObj.FLAGS}","${tallyObj.SCREEN}","${tallyObj.CONTROL}", "${tallyObj.INDEX}", ?)`, data, function(err) {
				if (err) {
					console.log('error inserting into DB');
					return console.log(err.message);
				}
			  });
			//   console.log(tallyObj);
			//   console.log(tallyObj.PBC);
			};
	}

}
  
function msSinceMidnight(d=null){
	// calculate the number of milliseconds since midnight
	if (d !== null) {
		var e = new Date(d)
	}	
	else{
		var e = new Date()
	}
	return (e.getTime() - e.setHours(0,0,0,0))
}
  
  module.exports = { Index, parse, msSinceMidnight };
  