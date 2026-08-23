import { Queue } from 'bullmq'
import { redisConnection } from '../../lib/redis'

// Um job por tick: varre os tenants ativos e enfileira um job de lembrete
// para cada um em `reminderQueue`.
export const schedulerQueue = new Queue('scheduler', { connection: redisConnection })

// Um job por tenant: chama sendPendingReminders() dentro do contexto daquele
// tenant (runWithTenant), respeitando o whatsapp_reminder_hours configurado
// por cada barbearia.
export const reminderQueue = new Queue<{ tenantId: string }>('reminders', { connection: redisConnection })

const SCHEDULER_JOB_NAME = 'scan-tenants'

/**
 * Registra o job repetível do scheduler (idempotente — BullMQ não duplica
 * um repeatable job com a mesma chave/config). Chamar uma vez ao subir o
 * worker.
 */
export async function scheduleReminderScan(everyMs = 15 * 60 * 1000) {
  await schedulerQueue.upsertJobScheduler(
    SCHEDULER_JOB_NAME,
    { every: everyMs },
    { name: SCHEDULER_JOB_NAME },
  )
}

// Um job por tick: varre as assinaturas Pix vencendo em breve e enfileira um
// job de renovação por tenant em `billingRenewQueue`.
export const billingScanQueue = new Queue('billing-scan', { connection: redisConnection })

// Um job por tenant: gera a próxima cobrança Pix dentro do contexto daquele
// tenant (runWithTenant). Cartão não passa por aqui — o MP cobra sozinho.
export const billingRenewQueue = new Queue<{ tenantId: string }>('billing-renew', {
  connection: redisConnection,
})

const BILLING_SCAN_JOB_NAME = 'scan-pix-subscriptions'

// Roda 1x/dia — cobrança Pix não precisa da granularidade de 15min dos
// lembretes de WhatsApp.
export async function scheduleBillingScan(everyMs = 24 * 60 * 60 * 1000) {
  await billingScanQueue.upsertJobScheduler(
    BILLING_SCAN_JOB_NAME,
    { every: everyMs },
    { name: BILLING_SCAN_JOB_NAME },
  )
}
