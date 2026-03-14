import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { notFoundHandler, globalErrorHandler } from '@/middlewares/error.middleware';
import { requestLogger } from '@/middlewares/request-logger.middleware';
import routes from '@/routes';

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'fraud-detection-service', status: 'healthy' });
});

app.use('/fraud-alerts', routes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export { app };
