/*
  Warnings:

  - You are about to drop the column `IS_CONTROL_DATA` on the `TSLMessage` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TSLMessage" (
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
    "RH_TALLY" INTEGER,
    "TEXT_TALLY" INTEGER,
    "LH_TALLY" INTEGER,
    "BRIGHTNESS" INTEGER,
    "LENGTH" INTEGER,
    "TEXT" TEXT
);
INSERT INTO "new_TSLMessage" ("BRIGHTNESS", "CONTROL", "FLAGS", "INDEX", "LENGTH", "LH_TALLY", "PBC", "RAWDATA", "RH_TALLY", "SCREEN", "TEXT", "TEXT_TALLY", "TIME", "TIMECODE", "TIMESTAMP", "VER", "id") SELECT "BRIGHTNESS", "CONTROL", "FLAGS", "INDEX", "LENGTH", "LH_TALLY", "PBC", "RAWDATA", "RH_TALLY", "SCREEN", "TEXT", "TEXT_TALLY", "TIME", "TIMECODE", "TIMESTAMP", "VER", "id" FROM "TSLMessage";
DROP TABLE "TSLMessage";
ALTER TABLE "new_TSLMessage" RENAME TO "TSLMessage";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
