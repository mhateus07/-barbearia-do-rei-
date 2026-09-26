-- DropIndex
DROP INDEX "payments_appointmentId_key";

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "barberId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "barbers" ADD COLUMN     "serviceIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "finishingMin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "processingMin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resourceId" TEXT,
ADD COLUMN     "returnDays" INTEGER;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "marketingConsent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "commissionRateSnapshot" DECIMAL(5,2),
ADD COLUMN     "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "loyaltyCredited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "returnOfId" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'DIRECT';

-- AlterTable
ALTER TABLE "appointment_services" ADD COLUMN     "finishingSnapshot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "processingSnapshot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resourceSnapshot" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "notification_logs" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dedupeKey" TEXT,
ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "work_schedules" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "openMinute" INTEGER NOT NULL,
    "closeMinute" INTEGER NOT NULL,

    CONSTRAINT "work_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_blocks" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "schedule_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_segments" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "resourceId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "kind" TEXT NOT NULL,

    CONSTRAINT "appointment_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_records" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "formula" TEXT,
    "products" TEXT,
    "preferences" TEXT,
    "notes" TEXT,
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photoConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "barberId" TEXT,
    "serviceIds" TEXT[],
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "offeredAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "reservedStart" TIMESTAMP(3),
    "reservedEnd" TIMESTAMP(3),
    "reservedBarberId" TEXT,
    "token" TEXT,
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "notificationId" TEXT,
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outreach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_schedules_barberId_weekday_key" ON "work_schedules"("barberId", "weekday");

-- CreateIndex
CREATE INDEX "schedule_blocks_barberId_startsAt_idx" ON "schedule_blocks"("barberId", "startsAt");

-- CreateIndex
CREATE INDEX "appointment_segments_barberId_startsAt_idx" ON "appointment_segments"("barberId", "startsAt");

-- CreateIndex
CREATE INDEX "appointment_segments_resourceId_startsAt_idx" ON "appointment_segments"("resourceId", "startsAt");

-- CreateIndex
CREATE INDEX "technical_records_clientId_createdAt_idx" ON "technical_records"("clientId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_entries_token_key" ON "waitlist_entries"("token");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_entries_appointmentId_key" ON "waitlist_entries"("appointmentId");

-- CreateIndex
CREATE INDEX "waitlist_entries_status_from_idx" ON "waitlist_entries"("status", "from");

-- CreateIndex
CREATE UNIQUE INDEX "outreach_token_key" ON "outreach"("token");

-- CreateIndex
CREATE UNIQUE INDEX "outreach_appointmentId_key" ON "outreach"("appointmentId");

-- CreateIndex
CREATE INDEX "outreach_clientId_createdAt_idx" ON "outreach"("clientId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_logs_dedupeKey_key" ON "notification_logs"("dedupeKey");

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_segments" ADD CONSTRAINT "appointment_segments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_records" ADD CONSTRAINT "technical_records_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Historical percentages were not stored. Preserve the current rate as the
-- migration baseline; it is not a reconstruction of past rate changes.
UPDATE appointments a SET "commissionRateSnapshot" = COALESCE(b."commissionRate", 0)
FROM barbers b WHERE b.id = a."barberId";
UPDATE appointments SET "loyaltyCredited" = true WHERE status = 'COMPLETED';

ALTER TABLE appointments ADD CONSTRAINT appointments_valid_interval CHECK ("endsAt" > "startsAt");
ALTER TABLE work_schedules ADD CONSTRAINT schedules_valid CHECK (weekday BETWEEN 0 AND 6 AND "openMinute" >= 0 AND "closeMinute" <= 1440 AND "openMinute" <= "closeMinute");
ALTER TABLE schedule_blocks ADD CONSTRAINT blocks_valid CHECK ("endsAt" > "startsAt");
ALTER TABLE products ADD CONSTRAINT stock_nonnegative CHECK (stock >= 0);
ALTER TABLE payments ADD CONSTRAINT payment_positive CHECK (amount > 0);
ALTER TABLE loyalty_cards ADD CONSTRAINT loyalty_balance_nonnegative CHECK ("pointsBalance" >= 0);
ALTER TABLE admins ADD CONSTRAINT valid_role CHECK (role IN ('OWNER', 'RECEPTION', 'PROFESSIONAL'));
ALTER TABLE admins ADD CONSTRAINT professional_has_profile CHECK (role <> 'PROFESSIONAL' OR "barberId" IS NOT NULL);

-- Preserve the existing single-business identity if not yet configured.
INSERT INTO settings (id, key, value, "updatedAt") VALUES
('legacy-shop-name', 'shop_name', 'Barbearia do Rei', CURRENT_TIMESTAMP),
('legacy-shop-phone', 'shop_phone', '(32) 99160-8852', CURRENT_TIMESTAMP),
('legacy-shop-address', 'shop_address', 'Rua Jose Narcisio Silva 1003, Fabricas, São João del Rei, MG', CURRENT_TIMESTAMP),
('legacy-shop-instagram', 'shop_instagram', '@opedro.seubarbeiro', CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;
