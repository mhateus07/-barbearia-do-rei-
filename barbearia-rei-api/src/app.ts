import { rateLimit } from './middlewares/rate-limit.middleware'
import operationsRoutes from './modules/operations/operations.routes'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { salonMiddleware } from './middlewares/salon.middleware'
import { authMiddleware, allowRoles } from './middlewares/auth.middleware'
import { errorMiddleware } from './middlewares/error.middleware'

import authRoutes from './modules/auth/auth.routes'
import barberRoutes from './modules/barbers/barbers.routes'
import serviceRoutes from './modules/services/services.routes'
import clientRoutes from './modules/clients/clients.routes'
import appointmentRoutes from './modules/appointments/appointments.routes'
import dashboardRoutes from './modules/dashboard/dashboard.routes'
import financesRoutes from './modules/finances/finances.routes'
import settingsRoutes from './modules/settings/settings.routes'
import notificationsRoutes from './modules/notifications/notifications.routes'
import publicRoutes from './modules/public/public.routes'

const app = express()

// Atrás do Nginx: usa o IP real do cliente (X-Forwarded-For) no rate limit.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1))
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  }),
)
app.use(express.json())

app.use('/api/v1', salonMiddleware)

// Rotas públicas
app.get('/health', (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString() }),
)
app.use('/api/v1/auth', rateLimit(30, 60000), authRoutes)
app.use('/api/v1/public', rateLimit(120, 60000), publicRoutes)

// Rotas protegidas
app.use(
  '/api/v1/barbers',
  authMiddleware,
  allowRoles('OWNER', 'RECEPTION'),
  barberRoutes,
)
app.use(
  '/api/v1/services',
  authMiddleware,
  allowRoles('OWNER', 'RECEPTION'),
  serviceRoutes,
)
app.use(
  '/api/v1/clients',
  authMiddleware,
  allowRoles('OWNER', 'RECEPTION'),
  clientRoutes,
)
app.use(
  '/api/v1/appointments',
  authMiddleware,
  allowRoles('OWNER', 'RECEPTION'),
  appointmentRoutes,
)
app.use(
  '/api/v1/dashboard',
  authMiddleware,
  allowRoles('OWNER', 'RECEPTION'),
  dashboardRoutes,
)
app.use(
  '/api/v1/finances',
  authMiddleware,
  allowRoles('OWNER', 'RECEPTION'),
  financesRoutes,
)
app.use(
  '/api/v1/settings',
  authMiddleware,
  allowRoles('OWNER', 'RECEPTION'),
  settingsRoutes,
)
app.use(
  '/api/v1/notifications',
  authMiddleware,
  allowRoles('OWNER', 'RECEPTION'),
  notificationsRoutes,
)

app.use('/api/v1/operations', authMiddleware, operationsRoutes)

app.use(errorMiddleware)

export { app }
