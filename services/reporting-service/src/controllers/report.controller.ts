import { Response } from 'express';
import {
  successResponse,
  errorResponse,
  HTTP_STATUS,
  createLogger,
  ROLES,
} from '@school-payment-gateway/shared-lib';
import { ReportService } from '@/services/report.service';
import { AuthRequest } from '@/middlewares/auth.middleware';

const logger = createLogger('report-controller');
const reportService = new ReportService();

const handleError = (err: unknown, res: Response): void => {
  logger.error({ err }, 'Report error');
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(HTTP_STATUS.INTERNAL_ERROR).json(errorResponse(message));
};

const resolveSchoolId = (req: AuthRequest): string | null => {
  const isAdmin = req.user?.role === ROLES.PLATFORM_ADMIN || req.user?.role === ROLES.SUPER_ADMIN;
  if (isAdmin) {
    return (req.query.schoolId as string | undefined) ?? (req.user?.schoolId as string | undefined) ?? null;
  }
  return (req.user?.schoolId as string | undefined) ?? null;
};

const getDateQuery = (req: AuthRequest) => ({
  schoolId: resolveSchoolId(req) ?? undefined,
  startDate: req.query.startDate as string | undefined,
  endDate: req.query.endDate as string | undefined,
  academicYear: req.query.academicYear as string | undefined,
  month: req.query.month ? Number(req.query.month) : undefined,
  year: req.query.year ? Number(req.query.year) : undefined,
});

export class ReportController {
  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      if (!schoolId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('schoolId is required'));
        return;
      }
      const data = await reportService.getDashboardSummary(schoolId);
      res.status(HTTP_STATUS.OK).json(successResponse(data));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getPaymentReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await reportService.getPaymentReport(getDateQuery(req));
      res.status(HTTP_STATUS.OK).json(successResponse(data));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getSPPReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await reportService.getSPPReport(getDateQuery(req));
      res.status(HTTP_STATUS.OK).json(successResponse(data));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getTransactionReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await reportService.getTransactionReport(getDateQuery(req));
      res.status(HTTP_STATUS.OK).json(successResponse(data));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getSettlementReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await reportService.getSettlementReport(getDateQuery(req));
      res.status(HTTP_STATUS.OK).json(successResponse(data));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getStudentReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await reportService.getStudentReport(getDateQuery(req));
      res.status(HTTP_STATUS.OK).json(successResponse(data));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getFinancialSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await reportService.getFinancialSummary(getDateQuery(req));
      res.status(HTTP_STATUS.OK).json(successResponse(data));
    } catch (err) {
      handleError(err, res);
    }
  }

  async exportPaymentsCSV(req: AuthRequest, res: Response): Promise<void> {
    try {
      const csv = await reportService.exportPaymentsCSV(getDateQuery(req));
      const filename = `payments-${Date.now()}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(HTTP_STATUS.OK).send(csv);
    } catch (err) {
      handleError(err, res);
    }
  }

  async exportBillsCSV(req: AuthRequest, res: Response): Promise<void> {
    try {
      const csv = await reportService.exportBillsCSV(getDateQuery(req));
      const filename = `spp-bills-${Date.now()}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(HTTP_STATUS.OK).send(csv);
    } catch (err) {
      handleError(err, res);
    }
  }
}
