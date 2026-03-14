import { Response } from 'express';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  HTTP_STATUS,
  createLogger,
  ROLES,
} from '@school-payment-gateway/shared-lib';
import { SettlementService, ERROR_CODES } from '@/services/settlement.service';
import { AuthRequest } from '@/middlewares/auth.middleware';

const logger = createLogger('settlement-controller');
const settlementService = new SettlementService();

const ERROR_STATUS: Record<string, number> = {
  [ERROR_CODES.SETTLEMENT_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
  [ERROR_CODES.SCHOOL_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
  [ERROR_CODES.SCHOOL_BANK_NOT_CONFIGURED]: HTTP_STATUS.BAD_REQUEST,
  [ERROR_CODES.NO_TRANSACTIONS_TO_SETTLE]: HTTP_STATUS.BAD_REQUEST,
  [ERROR_CODES.SETTLEMENT_ALREADY_PROCESSING]: HTTP_STATUS.CONFLICT,
  [ERROR_CODES.BELOW_MINIMUM_AMOUNT]: HTTP_STATUS.BAD_REQUEST,
};

const handleError = (err: unknown, res: Response): void => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status = ERROR_STATUS[message] ?? HTTP_STATUS.INTERNAL_ERROR;
  if (status >= 500) logger.error({ err }, 'Controller error');
  res.status(status).json(errorResponse(message));
};

const isAdmin = (req: AuthRequest): boolean =>
  req.user?.role === ROLES.PLATFORM_ADMIN || req.user?.role === ROLES.SUPER_ADMIN;

export class SettlementController {
  async createSettlement(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = isAdmin(req)
        ? (req.body.schoolId as string) ?? (req.user?.schoolId as string | undefined)
        : (req.user?.schoolId as string | undefined);

      if (!schoolId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('schoolId is required'));
        return;
      }

      const createdBy = req.user?.sub;
      const settlement = await settlementService.createSettlement(
        schoolId,
        createdBy as string | undefined,
      );

      logger.info({ batchId: settlement.batchId, by: req.user?.sub }, 'Settlement created');
      res.status(HTTP_STATUS.CREATED).json(successResponse(settlement, 'Settlement berhasil dibuat'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getSettlements(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, status, type, startDate, endDate } = req.query as Record<string, string | undefined>;

      const schoolId = isAdmin(req)
        ? (req.query.schoolId as string | undefined)
        : (req.user?.schoolId as string | undefined);

      const result = await settlementService.getSettlements({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        schoolId,
        status,
        type,
        startDate,
        endDate,
      });

      res.status(HTTP_STATUS.OK).json(paginatedResponse(result.data, result.pagination));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getSettlementById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const settlement = await settlementService.getSettlementById(req.params.id as string);

      if (!isAdmin(req) && settlement.schoolId.toString() !== (req.user?.schoolId as string | undefined)) {
        res.status(HTTP_STATUS.FORBIDDEN).json(errorResponse('Insufficient permissions'));
        return;
      }

      res.status(HTTP_STATUS.OK).json(successResponse(settlement));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getSettlementByBatchId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const settlement = await settlementService.getSettlementByBatchId(req.params.batchId as string);

      if (!isAdmin(req) && settlement.schoolId.toString() !== (req.user?.schoolId as string | undefined)) {
        res.status(HTTP_STATUS.FORBIDDEN).json(errorResponse('Insufficient permissions'));
        return;
      }

      res.status(HTTP_STATUS.OK).json(successResponse(settlement));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = isAdmin(req)
        ? (req.query.schoolId as string | undefined)
        : (req.user?.schoolId as string | undefined);

      const stats = await settlementService.getStats(schoolId);
      res.status(HTTP_STATUS.OK).json(successResponse(stats));
    } catch (err) {
      handleError(err, res);
    }
  }

  async retrySettlement(req: AuthRequest, res: Response): Promise<void> {
    try {
      const settlement = await settlementService.retrySettlement(req.params.id as string);
      logger.info({ id: req.params.id, by: req.user?.sub }, 'Settlement retried');
      res.status(HTTP_STATUS.OK).json(successResponse(settlement, 'Settlement berhasil di-retry'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async runAutoSettlement(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await settlementService.runAutomaticSettlement();
      logger.info({ result, by: req.user?.sub }, 'Manual auto-settlement triggered');
      res.status(HTTP_STATUS.OK).json(successResponse(result, 'Auto settlement selesai dijalankan'));
    } catch (err) {
      handleError(err, res);
    }
  }
}
