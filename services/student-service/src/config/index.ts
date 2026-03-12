import { createLogger } from '@school-payment-gateway/shared-lib';
import 'dotenv/config';
import { z } from 'zod';

const logger = createLogger('student-service');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default(3003),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().default('student_db'),

  INTERNAL_SERVICE_SECRET: z
    .string()
    .min(32, 'INTERNAL_SERVICE_SECRET must be at least 32 characters'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  MAX_IMPORT_FILE_SIZE: z.string().regex(/^\d+$/).transform(Number).default(5242880), // 5MB
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
