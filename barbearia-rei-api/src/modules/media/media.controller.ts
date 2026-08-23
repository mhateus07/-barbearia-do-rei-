import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { success, apiError } from '../../utils/response'
import { saveUploadedImage, deleteUploadedImage } from '../../lib/storage'
import { getSetting, updateSettings } from '../settings/settings.service'

interface UploadRequest extends AuthRequest {
  file?: Express.Multer.File
}

export async function uploadLogo(req: UploadRequest, res: Response) {
  if (!req.file) return apiError(res, 'Nenhum arquivo enviado', 400)

  const oldUrl = await getSetting('logo_url')
  const url = saveUploadedImage(req.tenantId!, req.file.originalname, req.file.buffer)
  await updateSettings({ settings: { logo_url: url } })
  if (oldUrl) deleteUploadedImage(req.tenantId!, oldUrl)

  return success(res, { url })
}

export async function uploadPortfolioImage(req: UploadRequest, res: Response) {
  if (!req.file) return apiError(res, 'Nenhum arquivo enviado', 400)

  const raw = await getSetting('portfolio_images')
  const current: string[] = JSON.parse(raw || '[]')

  const url = saveUploadedImage(req.tenantId!, req.file.originalname, req.file.buffer)
  const updated = [...current, url]
  await updateSettings({ settings: { portfolio_images: JSON.stringify(updated) } })

  return success(res, { url, portfolioImages: updated })
}

export async function deletePortfolioImage(req: AuthRequest, res: Response) {
  const { url } = req.body as { url?: string }
  if (!url) return apiError(res, 'url é obrigatória', 400)

  const raw = await getSetting('portfolio_images')
  const current: string[] = JSON.parse(raw || '[]')
  const updated = current.filter((u) => u !== url)

  await updateSettings({ settings: { portfolio_images: JSON.stringify(updated) } })
  deleteUploadedImage(req.tenantId!, url)

  return success(res, { portfolioImages: updated })
}
