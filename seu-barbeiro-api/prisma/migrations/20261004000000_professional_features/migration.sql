-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "depositAmount" DECIMAL(10,2),
ADD COLUMN     "depositExpiresAt" TIMESTAMP(3),
ADD COLUMN     "depositPaidAt" TIMESTAMP(3),
ADD COLUMN     "manageToken" TEXT,
ADD COLUMN     "subscriptionCovered" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionId" TEXT;

-- AlterTable
ALTER TABLE "commission_payments" ADD COLUMN     "advancesDeducted" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "barber_advances" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "givenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "settledInId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barber_advances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_sessions" (
    "id" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedById" TEXT NOT NULL,
    "openingAmount" DECIMAL(10,2) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "expectedAmount" DECIMAL(10,2),
    "countedAmount" DECIMAL(10,2),
    "notes" TEXT,

    CONSTRAINT "cash_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_movements" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "serviceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usesPerCycle" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priceSnapshot" DECIMAL(10,2) NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_charges" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pix_charges" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "providerId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "qrCode" TEXT,
    "qrCodeBase64" TEXT,
    "ticketUrl" TEXT,
    "error" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "appointmentId" TEXT,
    "subscriptionChargeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pix_charges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "barber_advances_barberId_settledInId_idx" ON "barber_advances"("barberId", "settledInId");

-- CreateIndex
CREATE INDEX "cash_sessions_openedAt_idx" ON "cash_sessions"("openedAt");

-- CreateIndex
CREATE INDEX "cash_movements_sessionId_idx" ON "cash_movements"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_adminId_idx" ON "push_subscriptions"("adminId");

-- CreateIndex
CREATE INDEX "subscriptions_status_currentPeriodEnd_idx" ON "subscriptions"("status", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "subscriptions_clientId_idx" ON "subscriptions"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_charges_paymentId_key" ON "subscription_charges"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_charges_subscriptionId_periodStart_key" ON "subscription_charges"("subscriptionId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "pix_charges_token_key" ON "pix_charges"("token");

-- CreateIndex
CREATE UNIQUE INDEX "pix_charges_providerId_key" ON "pix_charges"("providerId");

-- CreateIndex
CREATE INDEX "pix_charges_status_expiresAt_idx" ON "pix_charges"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_manageToken_key" ON "appointments"("manageToken");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_advances" ADD CONSTRAINT "barber_advances_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "barbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_advances" ADD CONSTRAINT "barber_advances_settledInId_fkey" FOREIGN KEY ("settledInId") REFERENCES "commission_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "cash_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_charges" ADD CONSTRAINT "subscription_charges_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pix_charges" ADD CONSTRAINT "pix_charges_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pix_charges" ADD CONSTRAINT "pix_charges_subscriptionChargeId_fkey" FOREIGN KEY ("subscriptionChargeId") REFERENCES "subscription_charges"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Regras que o Prisma não expressa: um único caixa aberto por salão e valores positivos.
CREATE UNIQUE INDEX "cash_sessions_single_open" ON "cash_sessions" ((true)) WHERE "closedAt" IS NULL;
ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_amounts_check" CHECK ("openingAmount" >= 0 AND ("countedAmount" IS NULL OR "countedAmount" >= 0));
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_amount_check" CHECK ("amount" > 0 AND "kind" IN ('SUPPLY', 'WITHDRAWAL'));
ALTER TABLE "barber_advances" ADD CONSTRAINT "barber_advances_amount_check" CHECK ("amount" > 0);
ALTER TABLE "plans" ADD CONSTRAINT "plans_values_check" CHECK ("price" > 0 AND ("usesPerCycle" IS NULL OR "usesPerCycle" > 0));
ALTER TABLE "pix_charges" ADD CONSTRAINT "pix_charges_amount_check" CHECK ("amount" > 0);
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_subscription_covered_check" CHECK ("subscriptionCovered" >= 0);
