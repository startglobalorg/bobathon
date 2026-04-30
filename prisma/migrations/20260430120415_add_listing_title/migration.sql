/*
  Warnings:

  - Added the required column `title` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "heroImage" TEXT NOT NULL,
    "gallery" TEXT NOT NULL,
    "sizeSqm" INTEGER NOT NULL,
    "priceChf" INTEGER NOT NULL,
    "rooms" REAL NOT NULL,
    "balcony" BOOLEAN NOT NULL,
    "parking" BOOLEAN NOT NULL,
    "addressLine" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "floor" INTEGER NOT NULL,
    "availabilityStart" DATETIME NOT NULL,
    "availabilityDurationMonths" INTEGER,
    "furnished" BOOLEAN NOT NULL,
    "petsAllowed" BOOLEAN NOT NULL,
    "customNotes" TEXT NOT NULL,
    "yearBuilt" INTEGER NOT NULL,
    "distanceFromCenterKm" REAL NOT NULL,
    "hasDishwasher" BOOLEAN NOT NULL,
    "hasLaundry" BOOLEAN NOT NULL,
    "hasElevator" BOOLEAN NOT NULL
);
INSERT INTO "new_Listing" ("addressLine", "availabilityDurationMonths", "availabilityStart", "balcony", "customNotes", "distanceFromCenterKm", "floor", "furnished", "gallery", "hasDishwasher", "hasElevator", "hasLaundry", "heroImage", "id", "lat", "lng", "neighborhood", "parking", "petsAllowed", "priceChf", "rooms", "sizeSqm", "yearBuilt") SELECT "addressLine", "availabilityDurationMonths", "availabilityStart", "balcony", "customNotes", "distanceFromCenterKm", "floor", "furnished", "gallery", "hasDishwasher", "hasElevator", "hasLaundry", "heroImage", "id", "lat", "lng", "neighborhood", "parking", "petsAllowed", "priceChf", "rooms", "sizeSqm", "yearBuilt" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
