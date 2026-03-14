import { Response } from 'express';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  HTTP_STATUS,
  createLogger,
  ROLES,
} from '@school-payment-gateway/shared-lib';
import { TransactionService, ERROR_CODES } from '@/services/transaction.service';
import { AuthRequest } from '@/middlewares/auth.middleware';

const logger = createLogger('transaction-controller');
const transactionService = new TransactionService();

const ERROR_STATUS: Record<string, number> = {
  [ERROR_CODES.TRANSACTION_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
  [ERROR_CODES.PAYMENT_ALREADY_RECORDED]: HTTP_STATUS.CONFLICT,
  [ERROR_CODES.INVALID_STATUS_TRANSITION]: HTTP_STATUS.BAD_REQUEST,
};

const handleError = (err: unknown, res: Response): void => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status = ERROR_STATUS[message] ?? HTTP_STATUS.INTERNAL_ERROR;
  if (status >= 500) logger.error({ err }, 'Controller error');
  res.status(status).json(errorResponse(message));
};

const resolveSchoolId = (req: AuthRequest, fromQuery = false): string | null => {
  const isAdmin = req.user?.role === ROLES.PLATFORM_ADMIN || req.user?.role === ROLES.SUPER_ADMIN;
  const userSchoolId = (req.user?.schoolId as string | undefined) ?? null;
  if (isAdmin) {
    const override = fromQuery
      ? (req.query.schoolId as string | undefined)
      : (req.body?.schoolId as string | undefined);
    return override ?? userSchoolId;
  }
  return userSchoolId;
};

export class TransactionController {
  async getTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, type, status, provider, startDate, endDate, studentId, billId, paymentId } =
        req.query as Record<string, string | undefined>;

      const schoolId = resolveSchoolId(req, true) ?? undefined;

      const result = await transactionService.getTransactions({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        schoolId,
        studentId,
        billId,
        paymentId,
        type,
        status,
        provider,
        startDate,
        endDate,
      });

      res.status(HTTP_STATUS.OK).json(paginatedResponse(result.data, result.pagination));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getTransactionById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const txn = await transactionService.getTransactionById(id);

      const isAdmin = req.user?.role === ROLES.PLATFORM_ADMIN || req.user?.role === ROLES.SUPER_ADMIN;

      if (!isAdmin && txn.schoolId.toString() !== req.user?.schoolId) {
        res.status(HTTP_STATUS.FORBIDDEN).json(errorResponse('Insufficient permissions'));
        return;
      }

      res.status(HTTP_STATUS.OK).json(successResponse(txn));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getBalance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req, true);

      if (!schoolId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('schoolId is required'));
        return;
      }

      const balance = await transactionService.getBalance(schoolId);
      res.status(HTTP_STATUS.OK).json(successResponse(balance));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query as Record<string, string | undefined>;
      const schoolId = resolveSchoolId(req, true);

      if (!schoolId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('schoolId is required'));
        return;
      }

      const stats = await transactionService.getStats(schoolId, startDate, endDate);
      res.status(HTTP_STATUS.OK).json(successResponse(stats));
    } catch (err) {
      handleError(err, res);
    }
  }

  async createRefund(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { paymentId, reason } = req.body as { paymentId: string; reason: string };
      const schoolId = (req.user?.schoolId as string | undefined) ?? '';

      const refundTxn = await transactionService.createRefund(paymentId, schoolId, reason);

      logger.info({ paymentId, ref: refundTxn.reference, by: req.user?.sub }, 'Refund created');

      res.status(HTTP_STATUS.CREATED).json(successResponse(refundTxn, 'Refund berhasil dibuat'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async reconcile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.body as { startDate: string; endDate: string };
      const schoolId = resolveSchoolId(req, false);

      if (!schoolId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('schoolId is required'));
        return;
      }

      const result = await transactionService.reconcile(schoolId, startDate, endDate);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (err) {
      handleError(err, res);
    }
  }

  async markAsSettled(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { transactionIds, settlementBatchId } = req.body as {
        transactionIds: string[];
        settlementBatchId: string;
      };

      await transactionService.markAsSettled(transactionIds, settlementBatchId);

      logger.info({ settlementBatchId, count: transactionIds.length }, 'Transactions settled via internal call');

      res.status(HTTP_STATUS.OK).json(successResponse(null, 'Transaksi berhasil di-settle'));
    } catch (err) {
      handleError(err, res);
    }
  }
}
