import { Router } from 'express'
import { listLogsHandler, sendCustomHandler, sendRemindersHandler } from './notifications.controller'

const router = Router()

router.get('/', listLogsHandler)
router.post('/send', sendCustomHandler)
router.post('/send-reminders', sendRemindersHandler)

export default router
