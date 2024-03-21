const { io, msToTimecode } = require('../config');
const tallyLogManager = require('./tallyLogManager');
const { saveTallyMessage } = require('./TallyLogService');


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
	if (data.length > 12) {
		saveTallyMessage(data, protocol); /// this is the database populating
	}

}
  
  
  module.exports = { Index, parse };
  