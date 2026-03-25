-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "adCost" DOUBLE PRECISION,
ADD COLUMN     "ageGroup" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "mbConversionId" TEXT,
ADD COLUMN     "mbRate" DOUBLE PRECISION,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmTerm" TEXT,
ADD COLUMN     "visitorId" TEXT,
ADD COLUMN     "zoneId" TEXT;

-- AlterTable
ALTER TABLE "Offer" ALTER COLUMN "dailyCap" SET DEFAULT 50;
