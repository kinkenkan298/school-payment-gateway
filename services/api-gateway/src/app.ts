import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import env from './config';
import { requestLogger } from './middlewares/request-logger.middleware';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware';
import router from './routes';

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: { success: false, message: 'Too many requests, please try again later' },
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'api-gateway', status: 'healthy' });
});

app.use(router);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
