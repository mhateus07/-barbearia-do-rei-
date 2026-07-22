import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { runWithTenant } from '../lib/tenant-context'
import { env } from '../config/env'

function extractSlugFromHostname(hostname: string): string | null {
  const suffix = `.${env.BASE_DOMAIN}`
  if (hostname.endsWith(suffix)) {
    return hostname.slice(0, -suffix.length)
  }
  return null
}

/**
 * Resolve o tenant a partir do subdomínio (`<slug>.app.impulsiodigital.com`)
 * para rotas que ainda não têm um JWT (login, agendamento público). Em dev
 * local (sem subdomínio real), usa o header `x-tenant-slug` ou a env
 * `TENANT_DEV_SLUG` como fallback.
 */
export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  const slug =
    extractSlugFromHostname(req.hostname) ||
    (req.headers['x-tenant-slug'] as string | undefined) ||
    env.TENANT_DEV_SLUG

  if (!slug) {
    return res.status(400).json({ error: { message: 'Não foi possível identificar a barbearia para esta requisição' } })
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) {
    return res.status(404).json({ error: { message: 'Barbearia não encontrada' } })
  }

  runWithTenant(tenant.id, next)
}
