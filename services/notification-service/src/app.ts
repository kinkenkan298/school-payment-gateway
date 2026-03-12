import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createLogger } from '@school-payment-gateway/shared-lib';

const logger = createLogger('notification-service');

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'notification-service', status: 'healthy' });
});

export { app };
