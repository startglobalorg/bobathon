-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "cookieId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_cookieId_key" ON "Profile"("cookieId");
