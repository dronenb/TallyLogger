// timer.js
// This does the timed or triggered output to AAF/AVB/OTIO
const { io, msToTimecode, msSinceMidnight } = require('../config');
const pythonScripts = require('./python-scripts');
const { frameRate } = require('../config');

let timeToOutputId = null;

// Timer to auto output if running with no user input (e.g. semi-automated)
function setTimer(mins = 60) {
	const timeAmount = mins * 60 * 1000; // x minutes in milliseconds
	
	// Clear any existing timer
	if (timeToOutputId) {
	  clearTimeout(timeToOutputId);
	}
  
	// Set a new timer
	timeToOutputId = setTimeout(function() {
		timedOutput(reset = false, timed = true); // This is where it runs the process every x minutes (false to reset timer)
	}, timeAmount);
  }

function resetTimer() {
	setTimer(); // Resets the timer
  }


/* the regular output module*/
// TODO - figure out how to deal with anything across midnight
async function timedOutput(reset = false, timed = false, data = data){
	text_message = 'Files created.';

// console.log(data);
	pythonScripts.writeToAAF(data);
	pythonScripts.writeToAVB(data);
	pythonScripts.writeToOTIO(data);
	
	const newStartTime = data.clips[data.clips.length -1].TIMESTAMP;
	if (reset){
		text_message = 'Files created and log reset'
		io.emit('udpData-reset', {TIMECODE: await msToTimecode(msSinceMidnight(),frameRate), TEXT: text_message, NEW_START_TIME: newStartTime, NEW_START_TIMECODE: await msToTimecode(msSinceMidnight(newStartTime), frameRate) });
	}
	else if (timed){

		text_message = 'Files auto-created'
		io.emit('udpData-info', {TIMECODE: await msToTimecode(msSinceMidnight(),frameRate), TEXT: text_message });
	}
	else{

		text_message = 'Files manually created'
		io.emit('udpData-info', {TIMECODE: await msToTimecode(msSinceMidnight(),frameRate), TEXT: text_message });
	}
	// Reset the timer after running the task
	resetTimer();

}

module.exports = { setTimer, resetTimer, timedOutput };
