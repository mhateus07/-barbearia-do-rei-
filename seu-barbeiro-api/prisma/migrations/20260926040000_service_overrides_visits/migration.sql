ALTER TABLE barbers ADD COLUMN "serviceOverrides" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE appointments ADD COLUMN "visitId" TEXT;
