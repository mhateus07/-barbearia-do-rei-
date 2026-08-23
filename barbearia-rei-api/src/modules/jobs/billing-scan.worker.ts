import { Worker } from 'bullmq'
import { redisConnection } from '../../lib/redis'
import { findTenantsDueForPixRenewal } from '../billing/billing.service'
import { billingRenewQueue } from './queues'

/**
 * A cada tick, varre todas as assinaturas Pix vencendo nos próximos dias
 * (consulta deliberadamente não escopada — mesma exceção documentada em
 * scheduler.worker.ts) e enfileira um job de renovação por tenant.
 */
export function startBillingScanWorker() {
  return new Worker(
    'billing-scan',
    async () => {
      const tenantIds = await findTenantsDueForPixRenewal()

      for (const tenantId of tenantIds) {
        await billingRenewQueue.add('renew-pix', { tenantId }, { removeOnComplete: true, removeOnFail: 50 })
      }

      return { subscriptionsScanned: tenantIds.length }
    },
    { connection: redisConnection },
  )
}
