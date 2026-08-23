import { Worker, Job } from 'bullmq'
import { redisConnection } from '../../lib/redis'
import { runWithTenant } from '../../lib/tenant-context'
import { renewPixSubscription } from '../billing/billing.service'

export function startBillingRenewWorker() {
  return new Worker(
    'billing-renew',
    async (job: Job<{ tenantId: string }>) => {
      return runWithTenant(job.data.tenantId, async () => {
        const payment = await renewPixSubscription()
        return { generated: Boolean(payment) }
      })
    },
    { connection: redisConnection, concurrency: 5 },
  )
}
