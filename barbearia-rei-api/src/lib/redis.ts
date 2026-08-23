import IORedis from 'ioredis'
import { env } from '../config/env'

// BullMQ exige maxRetriesPerRequest: null na conexão usada por Workers/Queues.
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
})
