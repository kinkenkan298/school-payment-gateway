import { createLogger } from '@school-payment-gateway/shared-lib';
import 'dotenv/config';
import { z } from 'zod';

const logger = createLogger('auth-service');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default(3001),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().default('auth_db'),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  EMAIL_VERIFICATION_EXPIRES_IN: z.string().regex(/^\d+$/).transform(Number).default(86400),
  PASSWORD_RESET_EXPIRES_IN: z.string().regex(/^\d+$/).transform(Number).default(3600),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).default(587),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().default('noreply@school-payment-gateway.com'),

  FRONTEND_URL: z.string().default('http://localhost:4000'),
});

type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  logger.error('❌ Invalid environment configuration');
  logger.error(z.prettifyError(result.error));
  process.exit(1);
}

export const env: Readonly<Env> = Object.freeze(result.data);
export default env;
