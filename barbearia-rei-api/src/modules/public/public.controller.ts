import { Request, Response } from 'express'
import { AppError } from '../../lib/errors'
import * as PublicService from './public.service'

export async function getInfo(req: Request, res: Response) {
  const info = await PublicService.getPublicInfo()
  res.json(info)
}

export async function getServices(req: Request, res: Response) {
  const services = await PublicService.getPublicServices()
  res.json(services)
}

export async function getBarbers(req: Request, res: Response) {
  const barbers = await PublicService.getPublicBarbers()
  res.json(barbers)
}

export async function getSlots(req: Request, res: Response) {
  const barberId = String(req.params.barberId)
  const date = String(req.query.date ?? '')
  const duration = String(req.query.duration ?? '')

  if (!date || !duration) {
    throw new AppError('date e duration são obrigatórios', 400)
  }

  const slots = await PublicService.getAvailableSlots(barberId, date, Number(duration))
  res.json({ slots })
}

export async function createAppointment(req: Request, res: Response) {
  const { clientName, clientPhone, clientEmail, barberId, serviceIds, date, time, notes } = req.body

  if (!clientName || !clientPhone || !barberId || !serviceIds?.length || !date || !time) {
    throw new AppError('Dados obrigatórios faltando', 400)
  }

  const appointment = await PublicService.createPublicAppointment({
    clientName,
    clientPhone,
    clientEmail,
    barberId,
    serviceIds,
    date,
    time,
    notes,
  })
  res.status(201).json(appointment)
}
