const { io,  msToTimecode, msSinceMidnight, frameRate, fs, path } = require('../config');
const { PrismaClient } = require('@prisma/client');
const jspack = require('jspack').jspack; // Unpacks Binary data
const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
});

// colors stored as RGB for simplicity and multiplied when used for AAF 
// these color names are in the google sheet dropcown https://docs.google.com/spreadsheets/d/19bTWGm3IQSVTuSmjjq_Sb0HAf60WVpnEWwxvxRDyl74/edit#gid=0
// so don't change unless changed there
// TODO - put this in SQlite db eventually
// need to getTapeNameData from SQL

async function saveTallyMessage(data, protocol){
    const parsedData = parseTallyMessage(data);
    const validationResult = validateTallyData(parsedData);
    if (!validationResult.isValid) {
      console.error('Validation errors:', validationResult.errors);
    } else {
      // Proceed with database operation
    prisma.TSLMessage.create({
        data: parsedData
    }).then(() => {
        // Handle success
        if (io) {  // Check if io is defined
            io.emit(protocol, parsedData);
        }
        else{
            console.log('socket.io does not exist')
        }
    }).catch((error) => {
        // Handle error
        console.log('tally FAILED');
        console.error(error);
    });
  }
}

function parseTallyMessage(data){
    const now = new Date().toISOString(); // ideally this would be from the TSL emitter
    let tallyObj = {};
    tallyObj.TIMESTAMP = now;
    tallyObj.RAWDATA = data;
    var cursor = 0;
    tallyObj.TIME = msSinceMidnight();
    tallyObj.TIMECODE = msToTimecode(tallyObj.TIME, frameRate)
    //Message Format in bytes
    const _PBC = 2 		  //2 bytes = 16 bits - Packet Byte Count of following packet
    const _VER = 1 		  // VERSION (8 bit)
    const _FLAGS = 1 	  // FLAGS (8 bit): Defined as follows:   
                        // Bit 0: Clear for ASCII based strings in packet, set for Unicode UTF-16LE  
                        // Bit 1: If set, data after SCREEN is screen control data (SCONTROL) 
                        // – otherwise  it’s display message data (DMSG) 
                        // Bit 2-7: Reserved (clear to 0) 
    const _SCREEN = 2	  // Primary index for use where each screen entity would have display indices (defined below) starting from 0. 
                        // Index 0xFFFF is reserved as a “Broadcast” to all screens. If not used, set to 0. 
    const _INDEX = 2	  // INDEX (16 bit): The 0 based address of the display, up to 65534 (0xFFFE). 
                        // Address 0xFFFF is reserved as a “Broadcast” address to all displays. 
    const _CONTROL = 2	// CONTROL (16 bit): Display control and tally data as follows:  
                        // Bit 0-1:  RH Tally Lamp state Bit 2-3:  Text Tally state Bit 4-5:  LH Tally Lamp state  Bit 6-7:  Brightness value (range 0-3)  Bit 8-14: Reserved (clear to 0) 
                        // Bit 15:  Control Data: following data to be interpreted as Control data rather  than Display data when set to 1.  
                        // 2 Bit Tally values are: 0 = OFF, 1 = RED, 2 = GREEN, 3 = AMBER. 
    //Display Data
    const _LENGTH = 2	  // Display Data: (CONTROL bit 15 is cleared to 0)  
                        // LENGTH (16 bit): Byte count of following text.  
                        // TEXT: UMD text, format defined by FLAGS byte.  
                        // Control Data: (CONTROL bit 15 is set to 1)  Not defined in this version of protocol. 

    // skipping the unneeded tally entries
    tallyObj.PBC = jspack.Unpack( "<H", data, cursor)[0];
    // console.log('PBC: ' + tallyObj.PBC); // 14 seems to be program
    cursor += _PBC;
    tallyObj.VER = jspack.Unpack( "<B", data, cursor)[0];
    // console.log('VER: ' + tallyObj.VER);
    cursor += _VER;
    tallyObj.FLAGS = jspack.Unpack( "<B", data, cursor)[0];
    // console.log('FLAGS: ' + tallyObj.FLAGS); // 0 seems to be default
    cursor += _FLAGS;
    tallyObj.SCREEN = jspack.Unpack( "<H", data, cursor)[0];
    // console.log('SCREEN: ' + tallyObj.SCREEN); // Screen that tally is sent to
    cursor += _SCREEN;
    tallyObj.INDEX = jspack.Unpack( "<H", data, cursor)[0];
    // console.log('INDEX: ' +tallyObj.INDEX); // Index - can be used for AUX busses??
    cursor += _INDEX;
    tallyObj.CONTROL = jspack.Unpack( "<H", data, cursor)[0];
    // console.log('CONTROL: ' + tallyObj.CONTROL); // 0, 192, 197 - seems to refer to brightness

    parseTallyState(tallyObj.CONTROL, tallyObj);

    // Now tallyObj includes RH_TALLY, TEXT_TALLY, LH_TALLY, BRIGHTNESS
    cursor += _CONTROL;

    var LENGTH = jspack.Unpack( "<H", data, cursor)[0]
    tallyObj.LENGTH = LENGTH;
    // console.log(LENGTH); // 4 ?
    cursor += _LENGTH;

    tallyObj.TEXT = jspack.Unpack( "s".repeat(LENGTH), data, cursor);

    if (tallyObj.TEXT != undefined) {
        tallyObj.TEXT = tallyObj.TEXT.join("")
    }
    return tallyObj;
}

async function upsertTape(tape) { // NB updates if exists, inserts if does not exist
  // console.log(tape);
    await prisma.source.upsert({
      where: {
        label: tape.tally_source, // Unique identifier
      },
      update: {
        tapeName: tape.tape_name,
        clipColorName: tape.color_name,
        clipColorRGB: tape.color_rgb,
      },
      create: {
        label: tape.tally_source,
        tapeName: tape.tape_name,
        clipColorName: tape.color_name,
        clipColorRGB: tape.color_rgb,
      },
    }).catch(err => console.error(`Error upserting tape: ${tape.tally_source}`, err));    
}


async function setupTapeNamePrisma() {


  // This gets the tapeName list from a CSV for the moment
// prone to errors if updated though
const tapeItems = await getCSV();
  for (let tape of tapeItems) {
    await upsertTape(tape);
  }
  console.log('All tapes have been processed in the database.');
}

async function getCSV() {
  const tapeNameDataPath = path.resolve(__dirname, '../data/TallyTapeName.csv');

  try {
    const data = await fs.promises.readFile(tapeNameDataPath, "utf8");
    const lines = data.split('\n');
    const tapeItemsPromises = lines.slice(1).map(async (line) => { // Use slice(1) to skip headers
      const columns = line.split(',').map(column => column.replace(/\r$/, '').trim());
      if (columns.length < 3) return null; // Skip invalid lines

      const [tally_source, tape_name, color_name] = columns;
      try {
        const rgb = await getRgbByColorName(color_name);
        return {
          tally_source: tally_source.trim(),
          tape_name: tape_name.trim(),
          color_name: color_name.trim(),
          color_rgb: rgb.toString(), 
        };
      } catch (err) {
        console.error(err);
        return null;
      }
    });

    // Wait for all Promises to resolve
    const tapeItems = await Promise.all(tapeItemsPromises);
    return tapeItems.filter(item => item !== null); // Filter out null items if any
  } catch (err) {
    console.error('Failed to read or process the CSV file:', err);
    throw err;
  }
}


async function getRgbByColorName(colorName) {
  // Fetch the color from the database
  const color = await prisma.color.findUnique({
    where: {
      name: colorName,
    },
  });

  if (!color) {
    // console.log(`Color not found! for ${colorName} - returning default`);
    const rgbArray = "[ 120, 120, 120 ]";
    // console.log(rgbArray);
    return rgbArray;
  }

  // Assuming the rgb is stored as a string "R,G,B"
  const rgbArray = color.rgb;  
  // console.log(`RGB for ${colorName}:`, rgbArray);
  return rgbArray;
}

function to16BitBinary(num) {
  // Convert the number to a binary string
  let binaryStr = num.toString(2);

  // Pad the binary string with zeros on the left to make it 16 bits long
  let paddedBinaryStr = binaryStr.padStart(16, '0');

  return paddedBinaryStr;
}

function parseTallyState(control, tallyObj) {
  const states = ['OFF', 'RED', 'GREEN', 'AMBER'];

  // Directly use bitwise operations on the control integer
  tallyObj.RH_TALLY = states[(control & 0b11)]; // Bits 0-1
  tallyObj.TEXT_TALLY = states[(control & 0b1100) >> 2]; // Bits 2-3
  tallyObj.LH_TALLY = states[(control & 0b110000) >> 4]; // Bits 4-5
  tallyObj.BRIGHTNESS = (control & 0b11000000) >> 6; // Bits 6-7, assuming you might need it
  // tallyObj.CONTROL_DATA = (control & 0x8000) ? 'Control Data' : 'Display Data'; // Bit 15
}

function validateTallyData(data) {
  const errors = [];

  // Validate RAWDATA
  if (!(data.RAWDATA instanceof Buffer)) {
    errors.push('RAWDATA must be a Buffer of bytes.');
  }

  // Updated validation for TIMESTAMP to accept ISO date strings
  if (typeof data.TIMESTAMP === 'string') {
    // Attempt to parse the string as a Date
    const timestampDate = new Date(data.TIMESTAMP);
    // Check if the date is Invalid Date
    if (isNaN(timestampDate.getTime())) {
      errors.push('TIMESTAMP must be a valid ISO date string.');
    }
  } else {
    errors.push('TIMESTAMP must be a string.');
  }

  // Validate TIME
  if (data.TIME !== null && typeof data.TIME !== 'undefined' && !Number.isInteger(data.TIME)) {
    errors.push('TIME must be an integer.');
  }

  // Validate TIMECODE, RH_TALLY, TEXT_TALLY, LH_TALLY, TEXT
  ['TIMECODE', 'RH_TALLY', 'TEXT_TALLY', 'LH_TALLY', 'TEXT'].forEach(field => {
    if (data[field] !== null && typeof data[field] !== 'undefined' && typeof data[field] !== 'string') {
      errors.push(`${field} must be a string.`);
    }
  });

  // Validate integer fields: PBC, VER, FLAGS, SCREEN, INDEX, CONTROL, BRIGHTNESS, LENGTH
  ['PBC', 'VER', 'FLAGS', 'SCREEN', 'INDEX', 'CONTROL', 'BRIGHTNESS', 'LENGTH'].forEach(field => {
    if (data[field] !== null && typeof data[field] !== 'undefined' && !Number.isInteger(data[field])) {
      errors.push(`${field} must be an integer.`);
    }
  });

  // Additional checks for specific fields
  // Example: Validate BRIGHTNESS is within the range 0-3
  if (data.BRIGHTNESS !== null && typeof data.BRIGHTNESS !== 'undefined') {
    if (data.BRIGHTNESS < 0 || data.BRIGHTNESS > 3) {
      errors.push('BRIGHTNESS must be in the range of 0 to 3.');
    }
  }

  // Example: Validate FLAGS bit constraints
  if (data.FLAGS !== null && typeof data.FLAGS !== 'undefined') {
    const maxFlagsValue = 0b11111111; // 8 bits
    if (data.FLAGS < 0 || data.FLAGS > maxFlagsValue) {
      errors.push('FLAGS must be within 8-bit range (0 to 255).');
    }
  }

  // Return an object indicating if the data is valid and any errors found
  return {
    isValid: errors.length === 0,
    errors,
  };
}


async function getTallyEvents(startTime, endTime) {
  console.log(startTime);
  console.log(endTime);
  try {
    // Step 1: Fetch TSLMessage records
    const messages = await prisma.TSLMessage.findMany({
      where: {
        AND: [
          { TIMESTAMP: { gte: startTime } },
          { TIMESTAMP: { lte: endTime } },
        ],
      },
      select: {
        TIME: true,
        TEXT: true,
        TIMESTAMP: true,
      },
    });

    return {
      // NB these names are then used as it passes to python
      // TODO - figure out how to deal with midnight / keep the date
      clips: messages,
      start: msSinceMidnight(startTime),
      end: msSinceMidnight(endTime)
    };

  } catch (err) {
    console.error('Error querying the database with Prisma:', err);
    throw err; // Allows the calling function to handle the error
  }
}


// Export the singleton instance
module.exports = {
    saveTallyMessage,setupTapeNamePrisma,getRgbByColorName, getTallyEvents
};
