-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "barbers" DROP CONSTRAINT "barbers_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "commission_payments" DROP CONSTRAINT "commission_payments_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "loyalty_cards" DROP CONSTRAINT "loyalty_cards_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "notification_logs" DROP CONSTRAINT "notification_logs_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "settings" DROP CONSTRAINT "settings_tenantId_fkey";

-- DropIndex
DROP INDEX "admins_email_key";

-- DropIndex
DROP INDEX "clients_email_key";

-- DropIndex
DROP INDEX "clients_phone_key";

-- DropIndex
DROP INDEX "settings_key_key";

-- AlterTable
ALTER TABLE "admins" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "barbers" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "commission_payments" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "expenses" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "loyalty_cards" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "notification_logs" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "settings" ALTER COLUMN "tenantId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "admins_tenantId_email_key" ON "admins"("tenantId", "email");

-- CreateIndex
CREATE INDEX "appointments_tenantId_startsAt_idx" ON "appointments"("tenantId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "clients_tenantId_phone_key" ON "clients"("tenantId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "clients_tenantId_email_key" ON "clients"("tenantId", "email");

-- CreateIndex
CREATE INDEX "expenses_tenantId_dueDate_idx" ON "expenses"("tenantId", "dueDate");

-- CreateIndex
CREATE INDEX "payments_tenantId_paidAt_idx" ON "payments"("tenantId", "paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "settings_tenantId_key_key" ON "settings"("tenantId", "key");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbers" ADD CONSTRAINT "barbers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_cards" ADD CONSTRAINT "loyalty_cards_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_payments" ADD CONSTRAINT "commission_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

