require('dotenv').config({ quiet: true })
const { spawnSync } = require('node:child_process')
const path = require('node:path')
const databases = process.env.SALON_DATABASES
  ? JSON.parse(process.env.SALON_DATABASES)
  : {
      [process.env.DEFAULT_SALON || 'barbearia-do-rei']:
        process.env.DATABASE_URL,
    }
for (const [slug, databaseUrl] of Object.entries(databases)) {
  if (!databaseUrl) throw new Error(`Banco não configurado: ${slug}`)
  console.log(`Aplicando migrações: ${slug}`)
  const result = spawnSync(
    process.execPath,
    [
      path.join(__dirname, '../node_modules/prisma/build/index.js'),
      'migrate',
      'deploy',
    ],
    { env: { ...process.env, DATABASE_URL: databaseUrl }, stdio: 'inherit' },
  )
  if (result.status !== 0) process.exit(result.status || 1)
}
