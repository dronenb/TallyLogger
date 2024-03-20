const sqlite3 = require('sqlite3').verbose();
const Timecode = require('smpte-timecode')

global.db = new sqlite3.Database('data/tally_log.sqlite'); // should only need to run once
// global.db = new sqlite3.Database(':memory:'); // option to run in memory??

// Holder for name -> RGB LUT for colours
const colorsRGB = {
  violet: [120,28,129],
  indigo: [64,67,153],
  blue: [72,139,194],
  green: [107,178,140],
  olive: [159,190,87],
  yellow: [210,179,63],
  orange: [231,126,49],
  red: [217,33,32],
  light_pink: [255, 182, 193],
  khaki: [240, 230, 140],
  dark_khaki: [189, 183, 107],
  plum: [221, 160, 221],
  medium_purple: [147, 112, 219],
  purple: [128, 0, 128],
  medium_slate_blue: [123, 104, 238],
  pale_green: [152, 251, 152],
  yellow_green: [154, 205, 50],
  teal: [0, 128, 128],
  aquamarine: [127, 255, 212],
  steel_blue: [70, 130, 180],
  tan: [210, 180, 140],
  brown: [165, 42, 42],
  silver: [192, 192, 192],
  black: [0, 0, 0]
  }

// This is to setup an SQLLite DB with data matching the MCAM.mov made
// function setupFakePGM(){

//   let csvPromise = getFakeCSV();
//       csvPromise.then(function(result) {
//         db.serialize(function() {
//           db.run( `CREATE TABLE IF NOT EXISTS fake_events (
//             tally_id INTEGER PRIMARY KEY AUTOINCREMENT,
//             tally_time TEXT,
//             tally_source TEXT,
//             tape_name TEXT,
//             color_name TEXT,
//             color_rgb TEXT
//           );`);
//           // Insert items from CSV into tape_name table
//           for(let i = 0; i < result.length; i++) {
//             let tape = result[i];
//             db.run("INSERT INTO fake_events"
//               + " (tally_time, tally_source, tape_name, color_name, color_rgb) VALUES"
//               + " ($tally_time, $tally_source, $tape_name, $color_name, $color_rgb)",
//             {
//               $tally_time: tape.tally_time,
//               $tally_source: tape.tally_source,
//               $tape_name: tape.tape_name,
//               $color_name: tape.color_name,
//               $color_rgb: tape.color_rgb
//             });
//           } // end for
  
//         });
//       })
// } // end setupFakePGM

// get CSV for dummy data above
// function getFakeCSV() {
//   const fakePGMpath = "/Users/trevoraylward/Downloads/Full mix - multicam flatten.csv"   
//   return new Promise(function(resolve, reject) {
//     require('fs').readFile(fakePGMpath, "utf8", function(err, data) {
//       if (err) {
//         reject(err);
//       } else {
//         let lines = data.split('\n'),
//             columns = [],
//             fakeItems = [];

//         for(let i = 0; i < lines.length - 1; i++) {
//           // Skip the row of column headers
//           if(i === 0) continue;

//           let j = Math.floor(Math.random() * (24)); // random number for color

//           let line = lines[i],
//               columns = line.split(',');
//           let tally_time = ((new Timecode(columns[2].slice(1, -1), 25, false)).toDate().toISOString()), // need to convert from TC to datetime
//               tally_source = columns[1].slice(1,-1),
//               tape_name = columns[0].slice(1,-1),
//               // random colour assignment
//               color_name = Object.keys(colorsRGB)[j],
//               color_rgb = colorsRGB[color_name].toString();

//           console.log(tally_time);

//           fakeItems.push({
//             "tally_time": tally_time,
//             "tally_source": tally_source,
//             "tape_name": tape_name,
//             "color_name": color_name,
//             "color_rgb": color_rgb
//           });

//         } // end for
//         resolve(fakeItems);

//       } // end else
//     }); // end readFile
//   }); // return promise
// } // end getFakeCSV

// This sets up the SQLite database for tape name against tally source names and colours
function setupTapeNameSQL(){
  let csvPromise = getCSV();
      csvPromise.then(function(result) {
        db.serialize(function() {
          db.run( `CREATE TABLE IF NOT EXISTS tape_name (
            tape_id INTEGER PRIMARY KEY AUTOINCREMENT,
            tally_source TEXT,
            tape_name TEXT,
            color_name TEXT,
            color_rgb TEXT
          );`);
          // Insert items from CSV into tape_name table
          for(let i = 0; i < result.length; i++) {
            let tape = result[i];
            db.run("INSERT INTO tape_name"
              + " (tally_source, tape_name, color_name, color_rgb) VALUES"
              + " ($tally_source, $tape_name, $color_name, $color_rgb)",
            {
              $tally_source: tape.tally_source,
              $tape_name: tape.tape_name,
              $color_name: tape.color_name,
              $color_rgb: tape.color_rgb
            });
          } // end for
  
        });
      })
} // end setupTapeNameSQL

// CSV for setupTapeNameSQL above
function getCSV() {
  let tapeNameDataPath = 'data/TallyTapeName.csv';
 
    
  return new Promise(function(resolve, reject) {
    require('fs').readFile(tapeNameDataPath, "utf8", function(err, data) {
      if (err) {
        reject(err);
      } else {
        let lines = data.split('\n'),
            columns = [],
            tapeItems = [];

        for(let i = 0; i < lines.length - 1; i++) {
          // Skip the row of column headers
          if(i === 0) continue;

          let line = lines[i],
              columns = line.split(',');

          let tally_source = columns[0],
              tape_name = columns[1],
              color_name = columns[2].trim(),
              color_rgb = colorsRGB[color_name].toString();
          

          tapeItems.push({
            "tally_source": tally_source,
            "tape_name": tape_name,
            "color_name": color_name,
            "color_rgb": color_rgb
          });

        } // end for
        resolve(tapeItems);

      } // end else
    }); // end readFile
  }); // return promise
} // end getCSV

function setupEventSQL(index=0){
  // SQLite commands to be executed in serial
  const commands = [
    `CREATE TABLE IF NOT EXISTS tally_events (
      event_id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT,
      text TEXT,
      msg BLOB,
      pbc TEXT,
      ver TEXT,
      flags TEXT,
      screen TEXT,
      control TEXT,
      indx TEXT
    );`,
    // Additional commands...
  ];

  if (index < commands.length) {
      const command = commands[index];
      // console.log(`Executing command: ${command}`);
      
      // Execute the command
      db.exec(command, (err) => {
        if (err) {
          console.error(`Error executing command: ${command}`);
          console.error(err);
        } else {
          console.log('SQlite running.')
          // console.log(`Command executed successfully: ${command}`);
        }
  
        // Move to the next command
        setupEventSQL(index + 1);
      });
    } else {
      // All commands have been executed, close the database
      // db.close();
    }
} // end setupEventSQL

// gets regular Tally Events from tally_events table in SQLite DB
function getTallyEvents(startTime, endTime, callback){
  console.log(`GetTallyEvents needs sorting - start: ${startTime} end: ${endTime}`)
  // Perform a SELECT query to retrieve data between the specified times
  const query = `SELECT * FROM tally_events WHERE time >= ? AND time <= ?`;
  db.all(query, [startTime, endTime], (err, rows) => {
    // TODO - this is not working for some reason
    // console.log("Query executed");
    if (err) {
      console.error('Error querying the database:', err.message);
    } else {
      // Process the retrieved rows
      rows.forEach((row) => {
        // console.log(row.text);
        // Simulate async operation with setTimeout
        setTimeout(() => {
          // console.log("Module function did something.");
          callback(null, `getTallyEvents finished`);
        }, 1000);
      });
    }
  });
}


function timecodeToDatetime(timecode, fps){
  const t = Timecode(timecode, fps=25, false);
  var s = t.frameCount/fps;
  return new Date(s * 1000);

}

function dateTimeToTimecode(d, fps){
  const t = Timecode(d, fps=25, false);
  return t;

}


module.exports = { setupTapeNameSQL, setupEventSQL, getTallyEvents, timecodeToDatetime, dateTimeToTimecode };