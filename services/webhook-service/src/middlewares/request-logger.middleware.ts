import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@school-payment-gateway/shared-lib';

const logger = createLogger('http');

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };
    if (res.statusCode >= 500) logger.error(log, 'Request error');
    else if (res.statusCode >= 400) logger.warn(log, 'Request warning');
    else logger.info(log, 'Request completed');
  });
  next();
};
