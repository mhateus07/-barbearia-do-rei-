import { Router } from 'express'
import {
  listLogsHandler,
  sendCustomHandler,
  sendRemindersHandler,
  sendReviewRequestsHandler,
} from './notifications.controller'

const router = Router()

router.get('/', listLogsHandler)
router.post('/send', sendCustomHandler)
router.post('/send-reminders', sendRemindersHandler)
router.post('/send-review-requests', sendReviewRequestsHandler)

export default router
