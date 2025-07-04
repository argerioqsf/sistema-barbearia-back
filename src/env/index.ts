import 'dotenv/config'
import { z } from 'zod'
import { InvalidEnvError } from '@/services/@errors/common/invalid-env-error'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  PASSWORD_SEED: z.string(),
  TOKEN_EMAIL_TWILIO: z.string(),
  APP_WEB_URL: z.string().url(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())
  throw new InvalidEnvError()
}

export const env = _env.data
