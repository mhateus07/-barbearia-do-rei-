require('dotenv').config({ quiet: true })
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const databases = process.env.SALON_DATABASES
  ? JSON.parse(process.env.SALON_DATABASES)
  : {
      [process.env.DEFAULT_SALON || 'barbearia-do-rei']:
        process.env.DATABASE_URL,
    }
const dir = process.env.BACKUP_DIR || '/var/backups/barbearia'
const keep = Number(process.env.BACKUP_KEEP || 10)
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
for (const [slug, databaseUrl] of Object.entries(databases)) {
  if (!databaseUrl) throw new Error(`Banco não configurado: ${slug}`)
  // pg_dump recusa parâmetros específicos do Prisma, como ?schema=
  const url = new URL(databaseUrl)
  url.searchParams.delete('schema')
  const file = path.join(dir, `${slug}-${stamp}.dump`)
  console.log(`Backup: ${slug} → ${file}`)
  const result = spawnSync(
    'pg_dump',
    ['--format=custom', '--no-owner', `--file=${file}`, url.toString()],
    { stdio: 'inherit' },
  )
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status || 1)
  fs.chmodSync(file, 0o600)
  const old = fs
    .readdirSync(dir)
    .filter((name) => new RegExp(`^${slug}-\\d{4}-.*\\.dump$`).test(name))
    .sort()
    .slice(0, -keep)
  for (const name of old) fs.unlinkSync(path.join(dir, name))
}
