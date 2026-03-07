import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { notFoundHandler, globalErrorHandler } from '@/middlewares/error.middleware';
import { requestLogger } from '@/middlewares/request-logger.middleware';
import routes from '@/routes';
import { env } from '@/config';

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'auth-service', status: 'healthy' });
});

app.use('/auth', routes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export { app };
