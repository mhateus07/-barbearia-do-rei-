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
 * Resolve o tenant para as rotas públicas (agendamento online). Prioridade:
 * 1) slug no path (`/api/v1/public/:tenantSlug/...`) — modelo atual, um
 *    domínio único pra toda a SaaS, sem depender de DNS/certificado por
 *    tenant.
 * 2) subdomínio (`<slug>.app.impulsiodigital.com`) — mantido como fallback
 *    caso um dia haja certificado wildcard e se volte a usar subdomínios.
 * 3) header x-tenant-slug / env TENANT_DEV_SLUG — conveniência de dev local.
 */
export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  const slug =
    (req.params.tenantSlug as string | undefined) ||
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
