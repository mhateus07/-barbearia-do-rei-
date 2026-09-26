import 'dotenv/config' // carrega .env antes de qualquer coisa
import './config/env' // valida as variáveis
import { startNotificationWorker } from './modules/notifications/notifications.service'
import { app } from './app'

process.env.TZ = process.env.SALON_TIMEZONE || 'America/Sao_Paulo'
if (process.env.NOTIFICATION_WORKER !== 'false') startNotificationWorker()

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})
