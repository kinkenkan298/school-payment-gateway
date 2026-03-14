import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { errorResponse, HTTP_STATUS } from '@school-payment-gateway/shared-lib';

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
      res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('Validation failed', errors));
      return;
    }
    req.body = result.data;
    next();
  };
};
