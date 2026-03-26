import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authMiddleware } from './middlewares/auth.middleware'
import { errorMiddleware } from './middlewares/error.middleware'

import authRoutes from './modules/auth/auth.routes'
import barberRoutes from './modules/barbers/barbers.routes'
import serviceRoutes from './modules/services/services.routes'
import clientRoutes from './modules/clients/clients.routes'
import appointmentRoutes from './modules/appointments/appointments.routes'
import dashboardRoutes from './modules/dashboard/dashboard.routes'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}))
app.use(express.json())

// Rotas públicas
app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }))
app.use('/api/v1/auth', authRoutes)

// Rotas protegidas
app.use('/api/v1/barbers', authMiddleware, barberRoutes)
app.use('/api/v1/services', authMiddleware, serviceRoutes)
app.use('/api/v1/clients', authMiddleware, clientRoutes)
app.use('/api/v1/appointments', authMiddleware, appointmentRoutes)
app.use('/api/v1/dashboard', authMiddleware, dashboardRoutes)

app.use(errorMiddleware)

export { app }
