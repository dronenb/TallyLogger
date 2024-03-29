const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    }

async function main() {
  for (const [name, rgb] of Object.entries(colorsRGB)) {
    const rgbString = rgb.join(',');
    await prisma.color.create({
      data: {
        name,
        rgb: rgbString,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
