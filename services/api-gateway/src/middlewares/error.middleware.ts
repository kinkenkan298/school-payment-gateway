import { Request, Response, NextFunction } from 'express';
import { createLogger, errorResponse, HTTP_STATUS } from '@school-payment-gateway/shared-lib';

const logger = createLogger('error-middleware');

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = HTTP_STATUS.INTERNAL_ERROR,
    public errors?: string[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse(`Route ${req.originalUrl} not found`));
};

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message, err.errors));
    return;
  }

  logger.error({ err, method: req.method, url: req.originalUrl }, 'Unhandled error');

  res.status(HTTP_STATUS.INTERNAL_ERROR).json(errorResponse('Internal server error'));
};
