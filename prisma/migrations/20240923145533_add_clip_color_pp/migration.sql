-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "tapeName" TEXT NOT NULL DEFAULT 'TapeNamenot set',
    "sourceChannel" TEXT NOT NULL DEFAULT 'Source Channel not set',
    "clipColorName" TEXT NOT NULL DEFAULT 'LightSkyBlue',
    "clipColorRGB" TEXT NOT NULL DEFAULT '[135, 206, 250]',
    "clipColorPP" TEXT NOT NULL DEFAULT 'Iris'
);
INSERT INTO "new_Source" ("clipColorName", "clipColorRGB", "id", "label", "sourceChannel", "tapeName") SELECT "clipColorName", "clipColorRGB", "id", "label", "sourceChannel", "tapeName" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
CREATE UNIQUE INDEX "Source_label_key" ON "Source"("label");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
