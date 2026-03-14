import mongoose from 'mongoose';
import { createLogger, buildPaginationMeta } from '@school-payment-gateway/shared-lib';
import { FraudAlert, IFraudAlert, RiskLevel } from '@/models/fraud-alert.model';
import { env } from '@/config';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('fraud-service');

export const ERROR_CODES = {
  ALERT_NOT_FOUND: 'ALERT_NOT_FOUND',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
} as const;

export interface PaymentPayload {
  paymentId: string;
  schoolId: string;
  studentId?: string;
  billId?: string;
  amount: number;
  adminFee?: number;
  totalAmount: number;
  provider: string;
  workflow: string;
  paidAt?: Date | string;
}

export interface FraudCheckResult {
  paymentId: string;
  schoolId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  approved: boolean;
}

export interface AlertQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  status?: string;
  riskLevel?: string;
  startDate?: string;
  endDate?: string;
}

const generateAlertId = (schoolId: string): string => {
  const suffix = schoolId.slice(-6).toUpperCase();
  const uuid = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `FRD-${suffix}-${Date.now()}-${uuid}`;
};

const resolveRiskLevel = (score: number): RiskLevel => {
  if (score >= env.CRITICAL_RISK_THRESHOLD) return 'critical';
  if (score >= env.HIGH_RISK_THRESHOLD) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

export class FraudService {
  async checkPayment(payload: PaymentPayload): Promise<FraudCheckResult> {
    const reasons: string[] = [];
    let riskScore = 0;

    const schoolOid = new mongoose.Types.ObjectId(payload.schoolId);
    const paymentOid = new mongoose.Types.ObjectId(payload.paymentId);
    const now = new Date();

    // Rule 1: Duplicate payment — billId yang sama dibayar dalam 5 menit
    if (payload.billId) {
      const billOid = new mongoose.Types.ObjectId(payload.billId);
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const duplicate = await FraudAlert.findOne({
        'metadata.billId': payload.billId,
        createdAt: { $gte: fiveMinAgo },
        paymentId: { $ne: paymentOid },
      });
      if (duplicate) {
        riskScore += 50;
        reasons.push('duplicate_payment: bill paid multiple times within 5 minutes');
      }
    }

    // Rule 2: High amount
    if (payload.totalAmount > 10_000_000) {
      riskScore += 30;
      reasons.push('very_high_amount: transaction above Rp 10.000.000');
    } else if (payload.totalAmount > 5_000_000) {
      riskScore += 20;
      reasons.push('high_amount: transaction above Rp 5.000.000');
    }

    // Rule 3: Rapid payments — sekolah yang sama > 10 pembayaran dalam 1 jam
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentCount = await FraudAlert.countDocuments({
      schoolId: schoolOid,
      createdAt: { $gte: oneHourAgo },
    });
    if (recentCount > 10) {
      riskScore += 25;
      reasons.push(`rapid_payments: ${recentCount} alerts from same school in last hour`);
    }

    // Rule 4: Odd hours — jam 00:00–05:00
    const paidAt = payload.paidAt ? new Date(payload.paidAt) : now;
    const hour = paidAt.getHours();
    if (hour >= 0 && hour < 5) {
      riskScore += 10;
      reasons.push(`odd_hours: payment at ${hour}:00 (midnight-5am)`);
    }

    // Rule 5: Multiple providers — studentId yang sama pakai > 3 provider berbeda hari ini
    if (payload.studentId) {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const providerVariety = await FraudAlert.aggregate([
        {
          $match: {
            'metadata.studentId': payload.studentId,
            createdAt: { $gte: todayStart },
          },
        },
        { $group: { _id: '$metadata.provider' } },
        { $count: 'total' },
      ]);
      const distinctProviders = providerVariety[0]?.total ?? 0;
      if (distinctProviders > 3) {
        riskScore += 15;
        reasons.push(`multiple_providers: ${distinctProviders} different providers used today`);
      }
    }

    // Cap score di 100
    riskScore = Math.min(riskScore, 100);
    const riskLevel = resolveRiskLevel(riskScore);
    const approved = riskLevel === 'low' || riskLevel === 'medium';

    // Simpan alert jika ada indikasi (score > 0)
    if (riskScore > 0) {
      await FraudAlert.create({
        alertId: generateAlertId(payload.schoolId),
        paymentId: paymentOid,
        schoolId: schoolOid,
        ...(payload.studentId && { studentId: new mongoose.Types.ObjectId(payload.studentId) }),
        riskScore,
        riskLevel,
        reasons,
        status: riskLevel === 'critical' || riskLevel === 'high' ? 'open' : 'open',
        metadata: {
          billId: payload.billId,
          studentId: payload.studentId,
          amount: payload.amount,
          totalAmount: payload.totalAmount,
          provider: payload.provider,
          workflow: payload.workflow,
          paidAt: payload.paidAt,
        },
      });

      logger.warn(
        { paymentId: payload.paymentId, riskScore, riskLevel, reasons },
        'Fraud alert created',
      );
    } else {
      logger.info({ paymentId: payload.paymentId }, 'Payment passed fraud check');
    }

    return {
      paymentId: payload.paymentId,
      schoolId: payload.schoolId,
      riskScore,
      riskLevel,
      reasons,
      approved,
    };
  }

  async getAlerts(query: AlertQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.schoolId) filter.schoolId = new mongoose.Types.ObjectId(query.schoolId);
    if (query.status) filter.status = query.status;
    if (query.riskLevel) filter.riskLevel = query.riskLevel;
    if (query.startDate || query.endDate) {
      const df: Record<string, Date> = {};
      if (query.startDate) df.$gte = new Date(query.startDate);
      if (query.endDate) df.$lte = new Date(query.endDate);
      filter.createdAt = df;
    }

    const [data, total] = await Promise.all([
      FraudAlert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FraudAlert.countDocuments(filter),
    ]);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getAlertById(id: string): Promise<IFraudAlert> {
    const alert = await FraudAlert.findById(id).lean();
    if (!alert) throw new Error(ERROR_CODES.ALERT_NOT_FOUND);
    return alert as IFraudAlert;
  }

  async updateAlertStatus(
    id: string,
    status: 'reviewing' | 'resolved' | 'false_positive',
    reviewedBy: string,
    note?: string,
  ): Promise<IFraudAlert> {
    const alert = await FraudAlert.findById(id);
    if (!alert) throw new Error(ERROR_CODES.ALERT_NOT_FOUND);

    if (alert.status === 'resolved' || alert.status === 'false_positive') {
      throw new Error(ERROR_CODES.INVALID_STATUS_TRANSITION);
    }

    const update: Record<string, unknown> = {
      status,
      reviewedBy: new mongoose.Types.ObjectId(reviewedBy),
      ...(note && { reviewNote: note }),
      ...(status === 'resolved' || status === 'false_positive'
        ? { resolvedAt: new Date() }
        : {}),
    };

    const updated = await FraudAlert.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    logger.info({ id, status, reviewedBy }, 'Fraud alert status updated');
    return updated as IFraudAlert;
  }

  async getStats(schoolId?: string) {
    const match: Record<string, unknown> = {};
    if (schoolId) match.schoolId = new mongoose.Types.ObjectId(schoolId);

    const [byRiskLevel, byStatus, daily, totals] = await Promise.all([
      FraudAlert.aggregate([
        { $match: match },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      FraudAlert.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      FraudAlert.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            count: { $sum: 1 },
            avgScore: { $avg: '$riskScore' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 30 },
      ]),
      FraudAlert.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgScore: { $avg: '$riskScore' },
            openCount: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
            criticalCount: {
              $sum: { $cond: [{ $eq: ['$riskLevel', 'critical'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const t = totals[0] ?? { total: 0, avgScore: 0, openCount: 0, criticalCount: 0 };

    return { byRiskLevel, byStatus, daily, totals: t };
  }
}
