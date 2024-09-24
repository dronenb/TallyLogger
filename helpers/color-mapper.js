// color-mapper.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
});


/* assigns tape name and colors to those labels that are unique (from PRISMA db) */
/* any missing tape names use label as tape name and a default grey color */

async function uniqueLabelsToColors(data){
	// console.log('Received data in uniqueLabelsToColors:', data);
	const array = data['clips'];
	const start = data['start'];
	const end = data['end'];
	const key = 'TEXT';

	// create unique array of source
	const uniqueLabels = [...new Set(array.map(item => item.TEXT))].sort();
	// Add PGM (which is hopefully unique!)
	uniqueLabels.push('PGM');
	
	// Fetch Source records
	// const tapeNameData = await prisma.source.findMany();
	const result = {};
	// console.log(tapeNameData); // check this is valid

for (let i = 0; i < uniqueLabels.length; i++) {
	try{
	// Find source in unique labels and add correct Color Value from tape_name_file_path
		const tapeExists = await prisma.source.findUnique({
			where: {
			label: uniqueLabels[i],
			},
		});
		if (!tapeExists) {
			// console.log("----" + uniqueLabels[i] + " has no entry in tapeNameData  ------")
			result[uniqueLabels[i]] = [uniqueLabels[i], [128,128,128],'Iris'];
		}
		else {
			// console.log(tapeExists.clipColorRGB);
			// console.log(tapeExists);
			result[uniqueLabels[i]] = [tapeExists.tapeName, tapeExists.clipColorRGB.split(',').map(Number,), tapeExists.clipColorPP];
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
