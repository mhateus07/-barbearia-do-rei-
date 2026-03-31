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

    const slots = await PublicService.getAvailableSlots(barberId, date, Number(duration))
    res.json({ slots })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function createAppointment(req: Request, res: Response) {
  try {
    const { clientName, clientPhone, clientEmail, barberId, serviceIds, date, time, notes } = req.body

    if (!clientName || !clientPhone || !barberId || !serviceIds?.length || !date || !time) {
      res.status(400).json({ message: 'Dados obrigatórios faltando' })
      return
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
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}
