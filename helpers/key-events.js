const tallyLogManager = require('./tallyLogManager');
const { getTallyEvents } = require('./sqlite');

async function handleExit() {
  global.logEndTime = new Date().toISOString();
  try {
    await new Promise((resolve, reject) => {
      getTallyEvents(logStartTime, logEndTime, (err, result) => {
        if (err) reject(err);
        else {
          console.log("Clean up done:", result);
          resolve(result);
        }
      });
    });
    // console.log("Cleanup completed. Exiting now.");
    db.close();
    // console.log('database closed');
    process.stdin.pause();
    process.exit(0);
  } catch (error) {
    console.error("An error occurred during cleanup:", error);
    db.close();
    console.log('database closed');
    process.stdin.pause();
    process.exit(1);
  }
}

// Key Events are from keyboard interaction
function setupKeyEvents(stdin, io, msSinceMidnight, frameRate, timedOutput) {
    const keypress = require('keypress');
  
    keypress(stdin);
  
    stdin.on('keypress', function (ch, key) {
      console.log('\n\nINFO: got "keypress"', key);
  
      if (key && key.ctrl && key.name == 'c') {
        if(tallyLogManager.getClips.length > 0){
          console.log('\n\nINFO: writing AAF/AVB/OTIO files and -- EXITING -- TallyLog\n\n');
          timedOutput(true);
          // Exit as control-c
          handleExit()
        }
        else {
          db.close();
          console.log('database closed');
          process.stdin.pause();
          process.exit(0);
        }
      }
  
      if (key && key.ctrl && key.name == "p") {
        if(tallyLogManager.getClips.length > 0){
          console.log('\n\nINFO: writing AAF/AVB/OTIO files and -- RESETTING -- tallyLog\n\n');
          // This is for AAF write at the current point and reset
          timedOutput(true);
        }
      }
  
      if (key && key.ctrl && key.name == "o") {
        if(tallyLogManager.getClips.length > 0){
          console.log('\n\nINFO: writing AAF/AVB/OTIO files -- WITHOUT resetting -- tallyLog\n\n');
          timedOutput(false);
        }
      }
    });
  
    // Resume stdin to allow key events
    stdin.setRawMode(true);
    stdin.resume();
  }
  
  module.exports = { setupKeyEvents };
  