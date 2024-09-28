// color-mapper.js
// This module assigns tape names and colors to unique labels fetched from the Prisma database.
// If a tape name is missing for a label, it defaults to using the label as the tape name and assigns a default grey color (RGB [128, 128, 128]).

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * This function takes clip data, extracts unique labels, 
 * and assigns each a corresponding tape name and color from the Prisma database.
 * @param {Object} data - Object containing 'clips' (array of clip data) and time range 'start'/'end'.
 * @returns {Object} - Returns an object mapping unique labels to their respective tape names and colors.
 */
async function uniqueLabelsToColors(data) {
    // Extract clips array and relevant time range
    const array = data['clips'];
    const start = data['start'];
    const end = data['end'];

    // Extract unique labels from the 'TEXT' key of the clips array
    const uniqueLabels = [...new Set(array.map(item => item.TEXT))].sort();
    
    // Add 'PGM' as an additional unique label, assuming it's always needed
    uniqueLabels.push('PGM');

    // Result object to store tape names and color mappings for unique labels
    const result = {};

    // Iterate through each unique label
    for (let i = 0; i < uniqueLabels.length; i++) {
        try {
            // Attempt to find the corresponding source record for the current label in the database
            const tapeExists = await prisma.source.findUnique({
                where: { label: uniqueLabels[i] },
            });

            // If no source record is found, assign the default gray color and use the label as the tape name
            if (!tapeExists) {
                result[uniqueLabels[i]] = [uniqueLabels[i], [128, 128, 128], 'Iris'];
            } else {
                // If a source record is found, assign the tape name and RGB color (from database)
                result[uniqueLabels[i]] = [
                    tapeExists.tapeName,
                    tapeExists.clipColorRGB.split(',').map(Number), // Convert RGB string to array of numbers
                    tapeExists.clipColorPP // Use the stored Premiere Pro color value
                ];
            }
        } catch (error) {
            // Log any errors encountered during database lookup
            console.log("Error in color-mapper: ", error.message);
        }
    }

    // Return the final result object mapping unique labels to their tape names and colors
    return result;
}

module.exports = { uniqueLabelsToColors };
