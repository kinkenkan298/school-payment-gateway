import { Response } from 'express';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  HTTP_STATUS,
  createLogger,
} from '@school-payment-gateway/shared-lib';
import { SchoolAdminService, ERROR_CODES } from '@/services/school-admin.service';
import { AuthRequest } from '@/middlewares/auth.middleware';

const logger = createLogger('school-admin-controller');
const service = new SchoolAdminService();

const ERROR_STATUS: Record<string, number> = {
  [ERROR_CODES.SCHOOL_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
  [ERROR_CODES.INVALID_KYC_TRANSITION]: HTTP_STATUS.BAD_REQUEST,
  [ERROR_CODES.CONFIG_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
  [ERROR_CODES.AUDIT_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
};

const handleError = (err: unknown, res: Response): void => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status = ERROR_STATUS[message] ?? HTTP_STATUS.INTERNAL_ERROR;
  if (status >= 500) logger.error({ err }, 'Controller error');
  res.status(status).json(errorResponse(message));
};

const getPerformedBy = (req: AuthRequest): string =>
  (req.user?.sub as string | undefined) ?? '';

export class SchoolAdminController {
  // ── Dashboard ────────────────────────────────────────────────────────────

  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await service.getPlatformDashboard();
      res.status(HTTP_STATUS.OK).json(successResponse(data));
    } catch (err) {
      handleError(err, res);
    }
  }

  // ── KYC ──────────────────────────────────────────────────────────────────

  async getPendingKyc(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const result = await service.getPendingKycSchools(page, limit);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (err) {
      handleError(err, res);
    }
  }

  async approveKyc(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { note } = req.body as { note?: string };
      await service.approveKyc(
        req.params.schoolId as string,
        getPerformedBy(req),
        note,
        req.ip,
      );
      logger.info({ schoolId: req.params.schoolId, by: getPerformedBy(req) }, 'KYC approved');
      res.status(HTTP_STATUS.OK).json(successResponse(null, 'KYC berhasil disetujui'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async rejectKyc(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { reason } = req.body as { reason: string };
      await service.rejectKyc(
        req.params.schoolId as string,
        getPerformedBy(req),
        reason,
        req.ip,
      );
      logger.info({ schoolId: req.params.schoolId, by: getPerformedBy(req) }, 'KYC rejected');
      res.status(HTTP_STATUS.OK).json(successResponse(null, 'KYC ditolak'));
    } catch (err) {
      handleError(err, res);
    }
  }

  // ── School Status ─────────────────────────────────────────────────────────

  async getSchoolById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const school = await service.getSchoolById(req.params.schoolId as string);
      res.status(HTTP_STATUS.OK).json(successResponse(school));
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateSchoolStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, note } = req.body as {
        status: 'active' | 'inactive' | 'suspended';
        note?: string;
      };
      await service.updateSchoolStatus(
        req.params.schoolId as string,
        status,
        getPerformedBy(req),
        note,
        req.ip,
      );
      res.status(HTTP_STATUS.OK).json(successResponse(null, 'Status sekolah berhasil diperbarui'));
    } catch (err) {
      handleError(err, res);
    }
  }

  // ── Platform Config ────────────────────────────────────────────────────────

  async getConfigs(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const configs = await service.getConfigs();
      res.status(HTTP_STATUS.OK).json(successResponse(configs));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getConfigByKey(req: AuthRequest, res: Response): Promise<void> {
    try {
      const config = await service.getConfigByKey(req.params.key as string);
      res.status(HTTP_STATUS.OK).json(successResponse(config));
    } catch (err) {
      handleError(err, res);
    }
  }

  async upsertConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { key, value, description } = req.body as {
        key: string;
        value: unknown;
        description?: string;
      };
      const config = await service.upsertConfig(
        key,
        value,
        getPerformedBy(req),
        description,
        req.ip,
      );
      res.status(HTTP_STATUS.OK).json(successResponse(config, 'Konfigurasi berhasil disimpan'));
    } catch (err) {
      handleError(err, res);
    }
  }

  // ── Audit Logs ─────────────────────────────────────────────────────────────

  async getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, action, targetType, targetId, performedBy, startDate, endDate } =
        req.query as Record<string, string | undefined>;

      const result = await service.getAuditLogs({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        action,
        targetType,
        targetId,
        performedBy,
        startDate,
        endDate,
      });

      res.status(HTTP_STATUS.OK).json(paginatedResponse(result.data, result.pagination));
    } catch (err) {
      handleError(err, res);
    }
  }
}
