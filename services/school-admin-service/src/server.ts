import { createLogger, connectDatabase, connectQueue } from '@school-payment-gateway/shared-lib';
import { app } from '@/app';
import { env } from '@/config';

const logger = createLogger('school-admin-service');

const start = async () => {
  await connectDatabase({ uri: env.MONGODB_URI, dbName: env.MONGODB_DB_NAME });
  await connectQueue(env.RABBITMQ_URL);

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'School Admin Service started');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    server.close(() => {
      logger.info('School admin service stopped');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'Unhandled rejection'));
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    process.exit(1);
  });
};

start();
