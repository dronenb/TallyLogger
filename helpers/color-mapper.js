/* assigns tape name and colors to those labels that are unique */
function uniqueLabelsToColors(data){
	const array = data['clips'];
	const start = data['start'];
	const end = data['end'];
	const key = 'TEXT';
	// create unique array of source
	const uniqueLabels = [...new Set(array.map(item => item.TEXT))].sort();
	// Add PGM (which is hopefully unique!)
	uniqueLabels.push('PGM');
	const result = {};

for (let i = 0; i < uniqueLabels.length; i++) {
	// console.log(tapeNameData); // check this is valid
	try{
	// Find source in unique labels and add correct Color Value from tape_name_file_path
	let j = tapeNameData.findIndex(({Source}) => Source === uniqueLabels[i]);
	// console.log(`uniqueLabels[i]: ${uniqueLabels[i]}`);
	// console.log(`index: ${tapeNameData}`);
	if (j<0){
		console.log("----" + uniqueLabels[i] + " has no entry in tapeNameData  ------")
		}
	else {
		result[uniqueLabels[i]] = [tapeNameData[j]['TapeName'], tapeNameData[j]['ColorValue']];
		}
	}
	catch (error){
		console.log("Error color-mapper: ", error.message);
	}
}
	// result is JSON sources against colours
	// console.log(result)
	return result;
}

module.exports = { uniqueLabelsToColors };
