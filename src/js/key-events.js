// key-events.js
// This module handles terminal-based keypress events to trigger specific actions in the TallyLogger system.
// Originally designed for terminal interaction, it is now less utilized due to the client-side nature of log start and end times.
// However, it can still be useful for manual control and debugging through the terminal.

const keypress = require('keypress');

// Function to handle graceful exit upon receiving certain keypress events (e.g., Ctrl + C)
async function handleExit() {
  logEndTime = new Date().toISOString();
  try {
    // await new Promise((resolve, reject) => {
    // Placeholder for any cleanup actions you might want to perform before exit
    // console.log('this would be a function to do when exiting');
    // });

    // Pause stdin and exit the process cleanly
    process.stdin.pause();
    process.exit(0);
  } catch (error) {
    // Handle any errors during the exit process
    console.error("An error occurred during cleanup:", error);
    process.stdin.pause();
    process.exit(1);
  }
}

// Function to set up key event listeners for terminal-based shortcuts
// It listens for specific keypress combinations (e.g., Ctrl + C, Ctrl + P, Ctrl + O) and triggers corresponding actions.
function setupKeyEvents(stdin, timedOutput) {
  // Enable keypress events for the stdin stream
  keypress(stdin);

  // Event listener for keypress events
  stdin.on('keypress', function (ch, key) {
    // console.log('\n\nINFO: got "keypress"', key);

    // Ctrl + C: Exit the process
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

  // Enable raw mode to capture all keypresses and resume stdin for listening
  stdin.setRawMode(true);
  stdin.resume();
}

// Export the setup function so it can be used in other parts of the application
module.exports = { setupKeyEvents };
