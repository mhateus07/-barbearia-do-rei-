import { Worker, Job } from 'bullmq'
import { redisConnection } from '../../lib/redis'
import { runWithTenant } from '../../lib/tenant-context'
import { sendPendingReminders, sendPendingReviewRequests } from '../notifications/notifications.service'

export function startReminderWorker() {
  return new Worker(
    'reminders',
    async (job: Job<{ tenantId: string }>) => {
      return runWithTenant(job.data.tenantId, async () => {
        const reminders = await sendPendingReminders()
        const reviewRequests = await sendPendingReviewRequests()
        return { reminders, reviewRequests }
      })
    },
    { connection: redisConnection, concurrency: 5 },
  )
}
