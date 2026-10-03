import { Router } from 'express'
import { summary, stats } from './dashboard.controller'

const router = Router()

router.get('/summary', summary)
router.get('/stats', stats)

export default router
