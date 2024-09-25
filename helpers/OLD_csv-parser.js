// no longer used I think


const fs = require('fs');
const { parse: parseCSV } = require('csv-parse');

// colors stored as RGB for simplicity and multiplied when used for AAF 
// these color names are in the google sheet dropcown https://docs.google.com/spreadsheets/d/19bTWGm3IQSVTuSmjjq_Sb0HAf60WVpnEWwxvxRDyl74/edit#gid=0
// so don't change unless changed there
// TODO - put this in SQlite db eventually
const colorsRGB = {
	violet: [120,28,129],
	indigo: [64,67,153],
	blue: [72,139,194],
	green: [107,178,140],
	olive: [159,190,87],
	yellow: [210,179,63],
	orange: [231,126,49],
	red: [217,33,32],
	lightPink: [255, 182, 193],
	khaki: [240, 230, 140],
	darkKhaki: [189, 183, 107],
	plum: [221, 160, 221],
	mediumPurple: [147, 112, 219],
	purple: [128, 0, 128],
	mediumSlateBlue: [123, 104, 238],
	paleGreen: [152, 251, 152],
	yellowGreen: [154, 205, 50],
	teal: [0, 128, 128],
	aquamarine: [127, 255, 212],
	steelBlue: [70, 130, 180],
	tan: [210, 180, 140],
	brown: [165, 42, 42],
	silver: [192, 192, 192],
	black: [0, 0, 0]
  };

function parseCSVFile(filePath) {

  const results = [];
  const readStream = fs.createReadStream(filePath);

  readStream.on('error', (error) => {
    console.log('---- Error reading the file ------- \n', error.message);
  });

  readStream
    .pipe(
      parseCSV({
        delimiter: ",",
        columns: true,
        ltrim: true,
      })
    )
    .on("data", function (row) {
      results.push(row);
    })
    .on("error", function (error) {
      console.log("An error occurred during the parsing:", error.message);
    })
    .on("end", function () {
      const data = [
        ...results.reduce((map, obj) => {
          if (!map.has(obj.Source)) map.set(obj.Source, obj);
          return map;
        }, new Map).values()
      ];
      for (const element in data) {
        // TODO - fix when there is no value for ColorName
        data[element]['ColorValue'] = colorsRGB[data[element]['ColorName']];
      }
      tapeNameData = data;
      return data;
      // console.log('tape name data:');
      // console.log(tapeNameData);

    });
}

module.exports = { parseCSVFile };
