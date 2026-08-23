import { Router, Response, NextFunction } from 'express'
import multer from 'multer'
import { uploadLogo, uploadPortfolioImage, deletePortfolioImage } from './media.controller'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { runWithTenant } from '../../lib/tenant-context'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// O parsing assíncrono do multer (leitura do stream multipart) pode escapar
// do AsyncLocalStorage estabelecido pelo authMiddleware. req.tenantId já foi
// setado de forma síncrona antes disso, então reestabelecemos o contexto
// aqui com base nele antes de chegar no controller.
function reestablishTenantContext(req: AuthRequest, _res: Response, next: NextFunction) {
  runWithTenant(req.tenantId!, next)
}

const router = Router()

router.post('/logo', upload.single('file'), reestablishTenantContext, uploadLogo)
router.post('/portfolio', upload.single('file'), reestablishTenantContext, uploadPortfolioImage)
router.delete('/portfolio', deletePortfolioImage)

export default router
