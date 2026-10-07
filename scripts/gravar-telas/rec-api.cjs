// API local só para gravar as telas do site. Usa o banco descartável salon_rec.
const url = 'postgresql://postgres:salon_test_only@127.0.0.1:55439/salon_rec'
const A = require('path').join(__dirname, '..', '..', 'seu-barbeiro-api')
Object.assign(process.env, {
  DATABASE_URL: url,
  SALON_DATABASES: JSON.stringify({ demo: url }),
  DEFAULT_SALON: 'demo',
  JWT_SECRET: 'local_recording_only_not_a_production_secret',
  FRONTEND_URL: 'http://localhost:5199',
  PUBLIC_WEB_URL: 'http://localhost:5199',
  TZ: 'America/Sao_Paulo',
  NOTIFICATION_WORKER: 'false',
})
const { app } = require(A + '/dist/app')
const { salons } = require(A + '/dist/lib/prisma')
const { hashPassword } = require(A + '/dist/utils/bcrypt')
const db = salons.get('demo').db
;(async () => {
  await db.admin.upsert({
    where: { email: 'demo@salon.local' },
    create: { name: 'Recepção', email: 'demo@salon.local', passwordHash: await hashPassword('Demo-salon-2026'), role: 'OWNER' },
    update: {},
  })
  for (const [key, value] of Object.entries({ shop_name: 'Barbearia Aurora', whatsapp_enabled: 'false' }))
    await db.settings.upsert({ where: { key }, create: { key, value }, update: { value } })
  app.listen(3334, '127.0.0.1', () => console.log('rec api 3334'))
})()
