const { getTallyEvents } = require('./sqlite');
logEndTime = '2024-03-12T00:01:46.596Z';
logStartTime = '2024-03-12T00:01:40.277Z';
getTallyEvents(logStartTime, logEndTime);

// Asynchronous function to handle cleanup operations
async function cleanupAndExit() {
    try {
      // Wrap the db.all call in a Promise
      const rows = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM tally_events", [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
  
      // Handle the rows as needed
      // console.log(rows);
  
      // Optional: close the database
      await new Promise((resolve, reject) => {
        db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
  
      // Exit the process
      process.exit(0);
    } catch (err) {
      console.error('Cleanup failed:', err);
      process.exit(1);
    }
  }


cleanupAndExit();

