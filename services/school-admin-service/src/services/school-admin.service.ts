import mongoose from 'mongoose';
import axios from 'axios';
import {
  createLogger,
  publishEvent,
  EXCHANGES,
  buildPaginationMeta,
} from '@school-payment-gateway/shared-lib';
import { AuditLog, AuditAction } from '@/models/audit-log.model';
import { PlatformConfig } from '@/models/platform-config.model';
import { env } from '@/config';

const logger = createLogger('school-admin-service');

export const ERROR_CODES = {
  SCHOOL_NOT_FOUND: 'SCHOOL_NOT_FOUND',
  INVALID_KYC_TRANSITION: 'INVALID_KYC_TRANSITION',
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  AUDIT_NOT_FOUND: 'AUDIT_NOT_FOUND',
} as const;

export interface AuditQuery {
  page?: number;
  limit?: number;
  action?: string;
  targetType?: string;
  targetId?: string;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
}

export class SchoolAdminService {
  private async logAudit(params: {
    action: AuditAction;
    performedBy: string;
    targetType: 'school' | 'user' | 'platform';
    targetId: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    note?: string;
    ip?: string;
  }): Promise<void> {
    await AuditLog.create({
      ...params,
      performedBy: new mongoose.Types.ObjectId(params.performedBy),
    });
  }

  // ── KYC Management ────────────────────────────────────────────────────────

  async approveKyc(schoolId: string, performedBy: string, note?: string, ip?: string): Promise<void> {
    const school = await this.getSchoolFromService(schoolId);
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);

    if (school.kycStatus !== 'pending') {
      throw new Error(ERROR_CODES.INVALID_KYC_TRANSITION);
    }

    await axios.patch(
      `${env.SCHOOL_SERVICE_URL}/schools/${schoolId}/kyc`,
      { kycStatus: 'verified' },
      { headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET } },
    );

    // Setelah KYC diverifikasi, aktifkan sekolah
    await axios.patch(
      `${env.SCHOOL_SERVICE_URL}/schools/${schoolId}/status`,
      { status: 'active' },
      { headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET } },
    );

    await this.logAudit({
      action: 'school.kyc_approved',
      performedBy,
      targetType: 'school',
      targetId: schoolId,
      before: { kycStatus: school.kycStatus, status: school.status },
      after: { kycStatus: 'verified', status: 'active' },
      note,
      ip,
    });

    await publishEvent(EXCHANGES.SETTLEMENT, 'school.verified', {
      schoolId,
      kycStatus: 'verified',
      approvedBy: performedBy,
      approvedAt: new Date(),
    });

    logger.info({ schoolId, by: performedBy }, 'School KYC approved');
  }

  async rejectKyc(schoolId: string, performedBy: string, reason: string, ip?: string): Promise<void> {
    const school = await this.getSchoolFromService(schoolId);
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);

    await axios.patch(
      `${env.SCHOOL_SERVICE_URL}/schools/${schoolId}/kyc`,
      { kycStatus: 'rejected' },
      { headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET } },
    );

    await this.logAudit({
      action: 'school.kyc_rejected',
      performedBy,
      targetType: 'school',
      targetId: schoolId,
      before: { kycStatus: school.kycStatus },
      after: { kycStatus: 'rejected' },
      note: reason,
      ip,
    });

    logger.info({ schoolId, by: performedBy, reason }, 'School KYC rejected');
  }

  // ── School Status Management ───────────────────────────────────────────────

  async updateSchoolStatus(
    schoolId: string,
    status: 'active' | 'inactive' | 'suspended',
    performedBy: string,
    note?: string,
    ip?: string,
  ): Promise<void> {
    const school = await this.getSchoolFromService(schoolId);
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);

    await axios.patch(
      `${env.SCHOOL_SERVICE_URL}/schools/${schoolId}/status`,
      { status },
      { headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET } },
    );

    const actionMap: Record<string, AuditAction> = {
      active: 'school.activated',
      suspended: 'school.suspended',
      inactive: 'school.deactivated',
    };

    await this.logAudit({
      action: actionMap[status] as AuditAction,
      performedBy,
      targetType: 'school',
      targetId: schoolId,
      before: { status: school.status },
      after: { status },
      note,
      ip,
    });

    logger.info({ schoolId, status, by: performedBy }, 'School status updated');
  }

  // ── Pending KYC Queue ──────────────────────────────────────────────────────

  async getPendingKycSchools(page = 1, limit = 10) {
    try {
      const response = await axios.get(
        `${env.SCHOOL_SERVICE_URL}/schools?status=pending&page=${page}&limit=${limit}`,
        { headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET } },
      );
      return response.data;
    } catch {
      return { data: [], pagination: {} };
    }
  }

  async getSchoolById(schoolId: string) {
    const school = await this.getSchoolFromService(schoolId);
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);
    return school;
  }

  // ── Platform Config ────────────────────────────────────────────────────────

  async getConfigs() {
    return PlatformConfig.find().sort({ key: 1 }).lean();
  }

  async getConfigByKey(key: string) {
    const config = await PlatformConfig.findOne({ key }).lean();
    if (!config) throw new Error(ERROR_CODES.CONFIG_NOT_FOUND);
    return config;
  }

  async upsertConfig(
    key: string,
    value: unknown,
    performedBy: string,
    description?: string,
    ip?: string,
  ) {
    const existing = await PlatformConfig.findOne({ key }).lean();

    const updated = await PlatformConfig.findOneAndUpdate(
      { key },
      {
        $set: {
          value,
          updatedBy: new mongoose.Types.ObjectId(performedBy),
          ...(description && { description }),
        },
      },
      { new: true, upsert: true },
    ).lean();

    await this.logAudit({
      action: 'platform.config_updated',
      performedBy,
      targetType: 'platform',
      targetId: key,
      before: existing ? { value: existing.value } : undefined,
      after: { value },
      ip,
    });

    logger.info({ key, by: performedBy }, 'Platform config updated');
    return updated;
  }

  // ── Audit Logs ─────────────────────────────────────────────────────────────

  async getAuditLogs(query: AuditQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.action) filter.action = query.action;
    if (query.targetType) filter.targetType = query.targetType;
    if (query.targetId) filter.targetId = query.targetId;
    if (query.performedBy)
      filter.performedBy = new mongoose.Types.ObjectId(query.performedBy);
    if (query.startDate || query.endDate) {
      const df: Record<string, Date> = {};
      if (query.startDate) df.$gte = new Date(query.startDate);
      if (query.endDate) df.$lte = new Date(query.endDate);
      filter.createdAt = df;
    }

    const [data, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  // ── Platform Dashboard ─────────────────────────────────────────────────────

  async getPlatformDashboard() {
    const [schoolStats, recentAuditLogs, configCount] = await Promise.all([
      this.getSchoolStatsFromService(),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
      PlatformConfig.countDocuments(),
    ]);

    return {
      schools: schoolStats,
      recentActivity: recentAuditLogs,
      configCount,
    };
  }

  private async getSchoolFromService(schoolId: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await axios.get(`${env.SCHOOL_SERVICE_URL}/schools/${schoolId}`, {
        headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET },
      });
      return response.data.data;
    } catch {
      return null;
    }
  }

  private async getSchoolStatsFromService(): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(`${env.SCHOOL_SERVICE_URL}/schools/stats`, {
        headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET },
      });
      return response.data.data ?? {};
    } catch {
      return {};
    }
  }
}
