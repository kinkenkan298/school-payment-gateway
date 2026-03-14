import { Request, Response, NextFunction } from 'express';
import {
  verifyJwt,
  JwtPayload,
  HTTP_STATUS,
  errorResponse,
  createLogger,
} from '@school-payment-gateway/shared-lib';
import { env } from '@/config';

const logger = createLogger('auth-middleware');

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(errorResponse('Missing or invalid token'));
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyJwt<JwtPayload>(token, env.JWT_SECRET);
    req.user = decoded;
    logger.debug({ sub: decoded.sub, role: decoded.role }, 'Token verified');
    next();
  } catch (err) {
    logger.warn({ err }, 'Authentication failed');
    res.status(HTTP_STATUS.UNAUTHORIZED).json(errorResponse('Invalid or expired token'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(errorResponse('Unauthorized'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json(errorResponse('Insufficient permissions'));
      return;
    }
    next();
  };
};
