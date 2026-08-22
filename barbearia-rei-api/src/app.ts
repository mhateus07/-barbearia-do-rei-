import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'node:path'
import fs from 'node:fs'
import { authMiddleware } from './middlewares/auth.middleware'
import { tenantMiddleware } from './middlewares/tenant.middleware'
import { errorMiddleware } from './middlewares/error.middleware'
import { env } from './config/env'

import { UPLOADS_ROOT } from './lib/storage'

import authRoutes from './modules/auth/auth.routes'
import barberRoutes from './modules/barbers/barbers.routes'
import serviceRoutes from './modules/services/services.routes'
import clientRoutes from './modules/clients/clients.routes'
import appointmentRoutes from './modules/appointments/appointments.routes'
import dashboardRoutes from './modules/dashboard/dashboard.routes'
import financesRoutes from './modules/finances/finances.routes'
import settingsRoutes from './modules/settings/settings.routes'
import notificationsRoutes from './modules/notifications/notifications.routes'
import waitlistRoutes from './modules/waitlist/waitlist.routes'
import publicRoutes from './modules/public/public.routes'
import mediaRoutes from './modules/media/media.routes'
import onboardingRoutes from './modules/onboarding/onboarding.routes'

const app = express()

// Atrás do Traefik em produção (ver docker-compose.prod.yml) — necessário
// pra rate limiting e logging identificarem o IP real do cliente via
// X-Forwarded-For, em vez do IP do proxy.
app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    origin: env.FRONTEND_URL
      ? env.FRONTEND_URL.split(',')
      : ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  }),
)
app.use(express.json())

// Uploads (logo/portfólio) servidos como arquivos estáticos. CORP liberado
// pra cross-origin porque em dev local o front (5173) e a API (3333) são
// origens diferentes; em produção ambos já ficam no mesmo subdomínio.
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  },
  express.static(UPLOADS_ROOT),
)

// Rotas públicas
app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }))
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/public/:tenantSlug', tenantMiddleware, publicRoutes)
app.use('/api/v1/onboarding', onboardingRoutes)

// Rotas protegidas
app.use('/api/v1/barbers', authMiddleware, barberRoutes)
app.use('/api/v1/services', authMiddleware, serviceRoutes)
app.use('/api/v1/clients', authMiddleware, clientRoutes)
app.use('/api/v1/appointments', authMiddleware, appointmentRoutes)
app.use('/api/v1/dashboard', authMiddleware, dashboardRoutes)
app.use('/api/v1/finances', authMiddleware, financesRoutes)
app.use('/api/v1/settings', authMiddleware, settingsRoutes)
app.use('/api/v1/notifications', authMiddleware, notificationsRoutes)
app.use('/api/v1/waitlist', authMiddleware, waitlistRoutes)
app.use('/api/v1/media', authMiddleware, mediaRoutes)

// Front-end (build do barbearia-rei-web), servido pela própria API — mesmo
// container, mesmo domínio. Só existe quando WEB_DIST_DIR aponta pra uma
// pasta com o build (produção/Docker); em dev local o Vite serve o front
// separadamente na porta 5173, então isso fica um no-op silencioso.
const WEB_DIST_DIR = process.env.WEB_DIST_DIR || path.resolve(process.cwd(), 'web-dist')
if (fs.existsSync(WEB_DIST_DIR)) {
  app.use(express.static(WEB_DIST_DIR))
  app.get(/^(?!\/api\/|\/uploads\/|\/health$).*/, (_req, res) => {
    res.sendFile(path.join(WEB_DIST_DIR, 'index.html'))
  })
}

app.use(errorMiddleware)

export { app }
