-- CreateTable
CREATE TABLE "TSLMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "RAWDATA" BLOB NOT NULL,
    "TIMESTAMP" DATETIME NOT NULL,
    "TIME" INTEGER,
    "TIMECODE" TEXT,
    "PBC" INTEGER,
    "VER" INTEGER,
    "FLAGS" INTEGER,
    "SCREEN" INTEGER,
    "INDEX" INTEGER,
    "CONTROL" INTEGER,
    "LENGTH" INTEGER,
    "TEXT" TEXT
);

-- CreateTable
CREATE TABLE "Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "tapeName" TEXT NOT NULL DEFAULT 'TapeNamenot set',
    "sourceChannel" TEXT NOT NULL DEFAULT 'Source Channel not set',
    "clipColorName" TEXT NOT NULL DEFAULT 'LightSkyBlue',
    "clipColorRGB" TEXT NOT NULL DEFAULT '[135, 206, 250]'
);

-- CreateTable
CREATE TABLE "Color" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "rgb" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_label_key" ON "Source"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Color_name_key" ON "Color"("name");
