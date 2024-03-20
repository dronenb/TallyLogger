// timer.js
// This does the timed or triggered output to AAF/AVB/OTIO
const { io, msToTimecode } = require('../config');
const tallyLogManager = require('./tallyLogManager');
const pythonScripts = require('./python-scripts');
const { msSinceMidnight } = require('./tally-timer')

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
function timedOutput(reset = false, timed = false){
	text_message = 'Files created.';
	// this is for AAF/AVB/OTIO write at current point and reset
	// last switch is end of sequence (i.e. that event is NOT included)
	let lastElement = tallyLogManager.popLastClip();
	if (lastElement){		
		tallyLogManager.setEndTime(lastElement['TIME']);
	}
	else{
		tallyLogManager.setEndTime(msToTimecode(msSinceMidnight()));
	}
	// console.log(getClips());
	// Use map to transform the clips array to just what is needed/expected
	let simplifiedData = {
		start: tallyLogManager.getStartTime(),
		end: tallyLogManager.getEndTime(),
		clips: tallyLogManager.getClips().map(clip => ({
		TIME: clip.TIME,
		TEXT: clip.TEXT
		}))
	};

	pythonScripts.writeToAAF(simplifiedData);
	pythonScripts.writeToAVB(simplifiedData);
	pythonScripts.writeToOTIO(simplifiedData);
	if (reset){
		// Reset tallylog
		tallyLogManager.setStartTime(tallyLogManager.getEndTime);
		tallyLogManager.setEndTime(0);
		tallyLogManager.clearClips;
		tallyLogManager.addClip(lastElement);
		text_message = 'Files created and log reset'
		io.emit('udpData-reset', {TIMECODE: msToTimecode(msSinceMidnight(),frameRate), TEXT: text_message });
	}
	else if (timed){
		text_message = 'Files auto-created'
		io.emit('udpData-info', {TIMECODE: msToTimecode(msSinceMidnight(),frameRate), TEXT: text_message });
	}
	else{
		text_message = 'Files manually created'
		io.emit('udpData-info', {TIMECODE: msToTimecode(msSinceMidnight(),frameRate), TEXT: text_message });
	}
	// Reset the timer after running the task
	resetTimer();
}

module.exports = { setTimer, resetTimer, timedOutput };
