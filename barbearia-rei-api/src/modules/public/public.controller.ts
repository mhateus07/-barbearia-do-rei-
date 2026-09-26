import { z } from 'zod'
import { Request, Response } from 'express'
import * as PublicService from './public.service'

export async function getInfo(req: Request, res: Response) {
  try {
    const info = await PublicService.getPublicInfo()
    res.json(info)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function getServices(req: Request, res: Response) {
  try {
    const services = await PublicService.getPublicServices()
    res.json(services)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function getBarbers(req: Request, res: Response) {
  try {
    const barbers = await PublicService.getPublicBarbers()
    res.json(barbers)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function getSlots(req: Request, res: Response) {
  try {
    const barberId = String(req.params.barberId)
    const date = String(req.query.date ?? '')
    const duration = String(req.query.duration ?? '')

    if (!date || !duration) {
      res.status(400).json({ message: 'date e duration são obrigatórios' })
      return
    }

    const slots = await PublicService.getAvailableSlots(
      barberId,
      date,
      Number(duration),
      String(req.query.serviceIds || '')
        .split(',')
        .filter(Boolean),
    )
    res.json({ slots })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function createAppointment(req: Request, res: Response) {
  try {
    const data = z
      .object({
        clientName: z.string().trim().min(2).max(120),
        clientPhone: z.string().min(10).max(25),
        clientEmail: z.string().email().optional().or(z.literal('')),
        barberId: z.union([z.string().uuid(), z.literal('any')]),
        serviceIds: z.array(z.string().uuid()).min(1).max(10),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        notes: z.string().max(2000).optional(),
        outreachToken: z.string().max(100).optional(),
      })
      .parse(req.body)
    const appointment = await PublicService.createPublicAppointment(data)
    res.status(201).json(appointment)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}
