import { Response } from 'express';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  HTTP_STATUS,
  createLogger,
  ROLES,
} from '@school-payment-gateway/shared-lib';
import { FraudService, ERROR_CODES } from '@/services/fraud.service';
import { AuthRequest } from '@/middlewares/auth.middleware';

const logger = createLogger('fraud-controller');
const fraudService = new FraudService();

const ERROR_STATUS: Record<string, number> = {
  [ERROR_CODES.ALERT_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
  [ERROR_CODES.INVALID_STATUS_TRANSITION]: HTTP_STATUS.BAD_REQUEST,
};

const handleError = (err: unknown, res: Response): void => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status = ERROR_STATUS[message] ?? HTTP_STATUS.INTERNAL_ERROR;
  if (status >= 500) logger.error({ err }, 'Controller error');
  res.status(status).json(errorResponse(message));
};

const isAdmin = (req: AuthRequest) =>
  req.user?.role === ROLES.PLATFORM_ADMIN || req.user?.role === ROLES.SUPER_ADMIN;

export class FraudController {
  async getAlerts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, status, riskLevel, startDate, endDate } =
        req.query as Record<string, string | undefined>;

      const schoolId = isAdmin(req)
        ? (req.query.schoolId as string | undefined)
        : (req.user?.schoolId as string | undefined);

      const result = await fraudService.getAlerts({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        schoolId,
        status,
        riskLevel,
        startDate,
        endDate,
      });

      res.status(HTTP_STATUS.OK).json(paginatedResponse(result.data, result.pagination));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getAlertById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const alert = await fraudService.getAlertById(req.params.id as string);

      if (!isAdmin(req) && alert.schoolId.toString() !== (req.user?.schoolId as string | undefined)) {
        res.status(HTTP_STATUS.FORBIDDEN).json(errorResponse('Insufficient permissions'));
        return;
      }

      res.status(HTTP_STATUS.OK).json(successResponse(alert));
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateAlertStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, note } = req.body as {
        status: 'reviewing' | 'resolved' | 'false_positive';
        note?: string;
      };
      const reviewedBy = (req.user?.sub as string | undefined) ?? '';

      const updated = await fraudService.updateAlertStatus(
        req.params.id as string,
        status,
        reviewedBy,
        note,
      );

      logger.info({ id: req.params.id, status, by: reviewedBy }, 'Alert status updated');
      res.status(HTTP_STATUS.OK).json(successResponse(updated, 'Status alert berhasil diperbarui'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = isAdmin(req)
        ? (req.query.schoolId as string | undefined)
        : (req.user?.schoolId as string | undefined);

      const stats = await fraudService.getStats(schoolId);
      res.status(HTTP_STATUS.OK).json(successResponse(stats));
    } catch (err) {
      handleError(err, res);
    }
  }
}
