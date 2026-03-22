-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'MaxBounty',
    "title" TEXT NOT NULL,
    "payout" DOUBLE PRECISION NOT NULL,
    "affiliatePostUrl" TEXT NOT NULL,
    "subParam" TEXT,
    "countries" TEXT[],
    "languages" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "prizeTheme" TEXT,
    "testLeads" INTEGER NOT NULL DEFAULT 0,
    "epc" DOUBLE PRECISION,
    "exitIntentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "exitIntentMaxShows" INTEGER NOT NULL DEFAULT 2,
    "exitIntentCooldownHours" INTEGER NOT NULL DEFAULT 24,
    "exitIntentSkipReturners" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "subId" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "variant" TEXT,
    "ip" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "variant" TEXT,
    "subId" TEXT,
    "depth" DOUBLE PRECISION,
    "sessionId" TEXT,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
