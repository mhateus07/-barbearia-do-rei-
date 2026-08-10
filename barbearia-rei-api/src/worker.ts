import 'dotenv/config'
import './config/env'
import { scheduleReminderScan } from './modules/jobs/queues'
import { startSchedulerWorker } from './modules/jobs/scheduler.worker'
import { startReminderWorker } from './modules/jobs/reminder.worker'

async function main() {
  const schedulerWorker = startSchedulerWorker()
  const reminderWorker = startReminderWorker()

  schedulerWorker.on('completed', (job, result) => {
    console.log(`[scheduler] tick concluído — ${result?.tenantsScanned ?? 0} tenant(s) escaneado(s)`, job.id)
  })
  schedulerWorker.on('failed', (job, err) => {
    console.error('[scheduler] falhou', job?.id, err.message)
  })
  reminderWorker.on('completed', (job, result) => {
    console.log(
      `[reminders] tenant ${job.data.tenantId} — enviados: ${result?.sent ?? 0}, falhas: ${result?.failed ?? 0}`,
    )
  })
  reminderWorker.on('failed', (job, err) => {
    console.error(`[reminders] falhou para tenant ${job?.data.tenantId}`, err.message)
  })

  await scheduleReminderScan()

  console.log('🛠️  Worker de jobs em background rodando (scheduler + reminders)')
}

main().catch((err) => {
  console.error('Erro fatal ao iniciar o worker:', err)
  process.exit(1)
})
