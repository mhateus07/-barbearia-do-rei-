-- Backfill: cria o tenant "barbearia-do-rei" e associa a ele todos os dados
-- pré-existentes (que hoje têm tenantId NULL, por serem de antes da introdução
-- de multi-tenancy). Conveniência de dev/staging para popular um tenant a
-- partir de dados single-tenant já existentes; não afeta o VPS de produção do
-- cliente real (sistema separado, fora do escopo desta SaaS) nem o VPS novo
-- (que roda as migrações do zero, sem dados a fazer backfill).

INSERT INTO "tenants" ("id", "slug", "name", "status", "createdAt", "updatedAt")
VALUES ('00000000-0000-4000-8000-000000000001', 'barbearia-do-rei', 'Barbearia do Rei', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE "admins" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "barbers" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "services" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "clients" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "appointments" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "payments" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "expenses" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "settings" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "loyalty_cards" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "commission_payments" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
UPDATE "notification_logs" SET "tenantId" = '00000000-0000-4000-8000-000000000001' WHERE "tenantId" IS NULL;
