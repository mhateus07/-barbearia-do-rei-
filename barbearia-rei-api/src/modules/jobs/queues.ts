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
