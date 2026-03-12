import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from '@/routes';
import { notFoundHandler, globalErrorHandler } from '@/middlewares/error.middleware';
import { requestLogger } from '@/middlewares/request-logger.middleware';

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'webhook-service', status: 'healthy' });
});

app.use('/webhooks', routes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export { app };
