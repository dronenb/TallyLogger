// key-events.js
// written for terminal based shortcuts - now not really working because of client-side nature of log start and end times


async function handleExit() {
  logEndTime = new Date().toISOString();
  try {
    // await new Promise((resolve, reject) => {
      console.log('this would be a function to do when exiting');
    // });
    process.stdin.pause();
    process.exit(0);
  } catch (error) {
    console.error("An error occurred during cleanup:", error);
    process.stdin.pause();
    process.exit(1);
  }
}

// Key Events are from keyboard interaction
function setupKeyEvents(stdin, timedOutput) {
    const keypress = require('keypress');
  
    keypress(stdin);
  
    stdin.on('keypress', function (ch, key) {
      console.log('\n\nINFO: got "keypress"', key);
  
      if (key && key.ctrl && key.name == 'c') {
          // Exit as control-c
          handleExit()
      }
  
      if (key && key.ctrl && key.name == "p") {
          // console.log('\n\nINFO: writing AAF/AVB/OTIO files and -- RESETTING -- tallyLog\n\n');
          // This is for AAF write at the current point and reset
          // timedOutput(true);
      }
  
      if (key && key.ctrl && key.name == "o") {
          // console.log('\n\nINFO: writing AAF/AVB/OTIO files -- WITHOUT resetting -- tallyLog\n\n');
          // This is for AAF write at the current point and not reset
          // timedOutput(false);
      }
    });
  
    // Resume stdin to allow key events
    stdin.setRawMode(true);
    stdin.resume();
  }
  
  module.exports = { setupKeyEvents };
  