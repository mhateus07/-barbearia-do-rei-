import { Worker } from 'bullmq'
import { redisConnection } from '../../lib/redis'
import { prisma } from '../../lib/prisma'
import { reminderQueue } from './queues'

/**
 * A cada tick, varre todos os tenants ativos (consulta deliberadamente não
 * escopada — é o único lugar do sistema que precisa iterar todos os tenants)
 * e enfileira um job de lembrete por tenant.
 */
export function startSchedulerWorker() {
  return new Worker(
    'scheduler',
    async () => {
      const tenants = await prisma.tenant.findMany({
        where: { status: { in: ['TRIAL', 'ACTIVE'] } },
        select: { id: true },
      })

      for (const tenant of tenants) {
        await reminderQueue.add(
          'send-reminders',
          { tenantId: tenant.id },
          { removeOnComplete: true, removeOnFail: 50 },
        )
      }

      return { tenantsScanned: tenants.length }
    },
    { connection: redisConnection },
  )
}
