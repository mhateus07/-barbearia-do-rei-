import 'dotenv/config'
import './config/env'
import { scheduleReminderScan, scheduleBillingScan } from './modules/jobs/queues'
import { startSchedulerWorker } from './modules/jobs/scheduler.worker'
import { startReminderWorker } from './modules/jobs/reminder.worker'
import { startBillingScanWorker } from './modules/jobs/billing-scan.worker'
import { startBillingRenewWorker } from './modules/jobs/billing-renew.worker'

async function main() {
  const schedulerWorker = startSchedulerWorker()
  const reminderWorker = startReminderWorker()
  const billingScanWorker = startBillingScanWorker()
  const billingRenewWorker = startBillingRenewWorker()

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
  billingScanWorker.on('completed', (job, result) => {
    console.log(
      `[billing-scan] tick concluído — ${result?.subscriptionsScanned ?? 0} assinatura(s) pra renovar`,
      job.id,
    )
  })
  billingScanWorker.on('failed', (job, err) => {
    console.error('[billing-scan] falhou', job?.id, err.message)
  })
  billingRenewWorker.on('completed', (job, result) => {
    console.log(
      `[billing-renew] tenant ${job.data.tenantId} — cobrança gerada: ${Boolean(result?.generated)}`,
    )
  })
  billingRenewWorker.on('failed', (job, err) => {
    console.error(`[billing-renew] falhou para tenant ${job?.data.tenantId}`, err.message)
  })

  await scheduleReminderScan()
  await scheduleBillingScan()

  console.log('🛠️  Worker de jobs em background rodando (scheduler + reminders + billing)')
}

main().catch((err) => {
  console.error('Erro fatal ao iniciar o worker:', err)
  process.exit(1)
})
