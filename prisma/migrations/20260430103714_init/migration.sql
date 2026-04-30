-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthday" DATETIME NOT NULL,
    "nationality" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "shortBio" TEXT NOT NULL,
    "cvPath" TEXT,
    "debtCollectionCertPath" TEXT,
    "proofOfSalaryPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PreviousLandlord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profileId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    CONSTRAINT "PreviousLandlord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Preferences" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profileId" INTEGER NOT NULL,
    "priceMaxChf" INTEGER NOT NULL,
    "roomsMin" REAL NOT NULL,
    "sizeSqmMin" INTEGER NOT NULL,
    "neighborhoods" TEXT NOT NULL,
    "needsBalcony" BOOLEAN NOT NULL DEFAULT false,
    "needsParking" BOOLEAN NOT NULL DEFAULT false,
    "petFriendly" BOOLEAN NOT NULL DEFAULT false,
    "furnishedPreference" TEXT NOT NULL DEFAULT 'any',
    CONSTRAINT "Preferences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
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

-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profileId" INTEGER NOT NULL,
    "listingId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "generatedCoverLetter" TEXT,
    "swipedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Preferences_profileId_key" ON "Preferences"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_profileId_listingId_key" ON "Application"("profileId", "listingId");
