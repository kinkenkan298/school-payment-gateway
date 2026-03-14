import mongoose from 'mongoose';
import { createLogger } from '@school-payment-gateway/shared-lib';
import {
  PaymentModel,
  StudentModel,
  BillModel,
  TransactionModel,
  SettlementModel,
  SchoolModel,
} from '@/database/models';

const logger = createLogger('report-service');

export interface DateRangeQuery {
  schoolId?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  month?: number;
  year?: number;
}

const toOid = (id: string) => new mongoose.Types.ObjectId(id);

const dateFilter = (start?: string, end?: string) => {
  if (!start && !end) return undefined;
  const f: Record<string, Date> = {};
  if (start) f.$gte = new Date(start);
  if (end) f.$lte = new Date(end);
  return f;
};

export class ReportService {
  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboardSummary(schoolId: string) {
    logger.info({ schoolId }, 'Generating dashboard summary');
    const oid = toOid(schoolId);

    const [
      paymentStats,
      billStats,
      transactionStats,
      settlementStats,
      studentStats,
      recentPayments,
    ] = await Promise.all([
      // Ringkasan pembayaran bulan ini
      PaymentModel.aggregate([
        {
          $match: {
            schoolId: oid,
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            total: { $sum: '$totalAmount' },
          },
        },
      ]),
      // Ringkasan tagihan
      BillModel.aggregate([
        { $match: { schoolId: oid } },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      // Total transaksi completed
      TransactionModel.aggregate([
        { $match: { schoolId: oid, type: 'payment', status: 'completed' } },
        {
          $group: {
            _id: null,
            totalGross: { $sum: '$amount' },
            totalFee: { $sum: '$fee' },
            totalNet: { $sum: '$netAmount' },
            count: { $sum: 1 },
          },
        },
      ]),
      // Settlement bulan ini
      SettlementModel.aggregate([
        {
          $match: {
            schoolId: oid,
            status: 'completed',
            completedAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        { $group: { _id: null, totalNet: { $sum: '$netAmount' }, count: { $sum: 1 } } },
      ]),
      // Total siswa aktif
      StudentModel.countDocuments({ schoolId: oid, status: 'active' }),
      // 5 pembayaran terakhir
      PaymentModel.find({ schoolId: oid })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('amount totalAmount status method provider createdAt')
        .lean(),
    ]);

    const txn = transactionStats[0] ?? { totalGross: 0, totalFee: 0, totalNet: 0, count: 0 };
    const settlement = settlementStats[0] ?? { totalNet: 0, count: 0 };

    return {
      payments: {
        byStatus: paymentStats,
        thisMonth: paymentStats.reduce((s: number, p: { total: number }) => s + p.total, 0),
      },
      bills: { byStatus: billStats },
      transactions: {
        totalGross: txn.totalGross,
        totalFee: txn.totalFee,
        totalNet: txn.totalNet,
        count: txn.count,
      },
      settlements: {
        thisMonth: settlement.totalNet,
        count: settlement.count,
      },
      students: { active: studentStats },
      recentPayments,
    };
  }

  // ── Laporan Pembayaran ─────────────────────────────────────────────────────

  async getPaymentReport(query: DateRangeQuery) {
    logger.info({ query }, 'Generating payment report');
    const match: Record<string, unknown> = {};
    if (query.schoolId) match.schoolId = toOid(query.schoolId);
    const df = dateFilter(query.startDate, query.endDate);
    if (df) match.createdAt = df;

    const [byStatus, byProvider, byMethod, byDay, totals] = await Promise.all([
      PaymentModel.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } },
      ]),
      PaymentModel.aggregate([
        { $match: { ...match, status: 'success' } },
        {
          $group: {
            _id: '$provider',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalFee: { $sum: '$adminFee' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      PaymentModel.aggregate([
        { $match: { ...match, status: 'success' } },
        { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } },
      ]),
      PaymentModel.aggregate([
        { $match: { ...match, status: 'success' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            count: { $sum: 1 },
            total: { $sum: '$totalAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
      PaymentModel.aggregate([
        { $match: { ...match, status: 'success' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalFee: { $sum: '$adminFee' },
            totalGross: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const t = totals[0] ?? { totalAmount: 0, totalFee: 0, totalGross: 0, count: 0 };

    return {
      period: { startDate: query.startDate, endDate: query.endDate },
      totals: t,
      byStatus,
      byProvider,
      byMethod,
      byDay,
    };
  }

  // ── Laporan SPP ────────────────────────────────────────────────────────────

  async getSPPReport(query: DateRangeQuery) {
    logger.info({ query }, 'Generating SPP report');
    const match: Record<string, unknown> = {};
    if (query.schoolId) match.schoolId = toOid(query.schoolId);
    if (query.academicYear) match.academicYear = query.academicYear;
    if (query.year) match.year = query.year;
    if (query.month) match.month = query.month;

    const [byStatus, byGrade, byMonth, overdueBills, totals] = await Promise.all([
      BillModel.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
        { $sort: { count: -1 } },
      ]),
      BillModel.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student',
          },
        },
        { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$student.grade',
            total: { $sum: 1 },
            paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
            unpaid: { $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0] } },
            overdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } },
            totalAmount: { $sum: '$amount' },
            paidAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      BillModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: { month: '$month', year: '$year' },
            total: { $sum: 1 },
            paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
            unpaid: { $sum: { $cond: [{ $in: ['$status', ['unpaid', 'overdue']] }, 1, 0] } },
            collectedAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      BillModel.find({
        ...match,
        status: 'overdue',
        dueDate: { $lt: new Date() },
      })
        .sort({ dueDate: 1 })
        .limit(50)
        .lean(),
      BillModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalBills: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            paidAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] },
            },
            unpaidAmount: {
              $sum: { $cond: [{ $in: ['$status', ['unpaid', 'overdue']] }, '$amount', 0] },
            },
            collectionRate: {
              $avg: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const t = totals[0] ?? {
      totalBills: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      collectionRate: 0,
    };

    return {
      period: { academicYear: query.academicYear, month: query.month, year: query.year },
      totals: {
        ...t,
        collectionRate: Math.round((t.collectionRate ?? 0) * 100),
      },
      byStatus,
      byGrade,
      byMonth,
      overdueBills,
    };
  }

  // ── Laporan Transaksi ──────────────────────────────────────────────────────

  async getTransactionReport(query: DateRangeQuery) {
    logger.info({ query }, 'Generating transaction report');
    const match: Record<string, unknown> = {};
    if (query.schoolId) match.schoolId = toOid(query.schoolId);
    const df = dateFilter(query.startDate, query.endDate);
    if (df) match.createdAt = df;

    const [byType, byProvider, byStatus, daily, totals] = await Promise.all([
      TransactionModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalFee: { $sum: '$fee' },
            netAmount: { $sum: '$netAmount' },
          },
        },
      ]),
      TransactionModel.aggregate([
        { $match: { ...match, type: 'payment', status: 'completed' } },
        {
          $group: {
            _id: '$provider',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      TransactionModel.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      TransactionModel.aggregate([
        { $match: { ...match, type: 'payment', status: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalFee: { $sum: '$fee' },
            netAmount: { $sum: '$netAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
      TransactionModel.aggregate([
        { $match: { ...match, type: 'payment', status: 'completed' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalGross: { $sum: '$amount' },
            totalFee: { $sum: '$fee' },
            totalNet: { $sum: '$netAmount' },
          },
        },
      ]),
    ]);

    const t = totals[0] ?? { count: 0, totalGross: 0, totalFee: 0, totalNet: 0 };

    return {
      period: { startDate: query.startDate, endDate: query.endDate },
      totals: t,
      byType,
      byProvider,
      byStatus,
      daily,
    };
  }

  // ── Laporan Settlement ─────────────────────────────────────────────────────

  async getSettlementReport(query: DateRangeQuery) {
    logger.info({ query }, 'Generating settlement report');
    const match: Record<string, unknown> = {};
    if (query.schoolId) match.schoolId = toOid(query.schoolId);
    const df = dateFilter(query.startDate, query.endDate);
    if (df) match.createdAt = df;

    const [byStatus, monthly, topSchools, totals] = await Promise.all([
      SettlementModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalNet: { $sum: '$netAmount' },
          },
        },
      ]),
      SettlementModel.aggregate([
        { $match: { ...match, status: 'completed' } },
        {
          $group: {
            _id: { year: { $year: '$completedAt' }, month: { $month: '$completedAt' } },
            count: { $sum: 1 },
            totalGross: { $sum: '$grossAmount' },
            totalFee: { $sum: '$totalFee' },
            totalNet: { $sum: '$netAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      SettlementModel.aggregate([
        { $match: { ...match, status: 'completed' } },
        {
          $group: {
            _id: '$schoolId',
            count: { $sum: 1 },
            totalNet: { $sum: '$netAmount' },
          },
        },
        { $sort: { totalNet: -1 } },
        { $limit: 10 },
      ]),
      SettlementModel.aggregate([
        { $match: { ...match, status: 'completed' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalGross: { $sum: '$grossAmount' },
            totalFee: { $sum: '$totalFee' },
            totalNet: { $sum: '$netAmount' },
          },
        },
      ]),
    ]);

    const t = totals[0] ?? { count: 0, totalGross: 0, totalFee: 0, totalNet: 0 };

    return {
      period: { startDate: query.startDate, endDate: query.endDate },
      totals: t,
      byStatus,
      monthly,
      topSchools,
    };
  }

  // ── Laporan Siswa ──────────────────────────────────────────────────────────

  async getStudentReport(query: DateRangeQuery) {
    logger.info({ query }, 'Generating student report');
    const match: Record<string, unknown> = {};
    if (query.schoolId) match.schoolId = toOid(query.schoolId);

    const [byStatus, byGrade, importStats, totalStudents] = await Promise.all([
      StudentModel.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      StudentModel.aggregate([
        { $match: { ...match, status: 'active' } },
        { $group: { _id: '$grade', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      StudentModel.aggregate([
        { $match: { ...match, status: 'active' } },
        {
          $group: {
            _id: '$academicYear',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 5 },
      ]),
      StudentModel.countDocuments(match),
    ]);

    return {
      total: totalStudents,
      byStatus,
      byGrade,
      byAcademicYear: importStats,
    };
  }

  // ── Laporan Keuangan Gabungan ───────────────────────────────────────────────

  async getFinancialSummary(query: DateRangeQuery) {
    logger.info({ query }, 'Generating financial summary');
    const match: Record<string, unknown> = {};
    if (query.schoolId) match.schoolId = toOid(query.schoolId);
    const df = dateFilter(query.startDate, query.endDate);
    if (df) match.createdAt = df;

    const [payments, transactions, settlements] = await Promise.all([
      PaymentModel.aggregate([
        { $match: { ...match, status: 'success' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalFee: { $sum: '$adminFee' },
            totalGross: { $sum: '$totalAmount' },
          },
        },
      ]),
      TransactionModel.aggregate([
        { $match: { ...match, type: 'payment', status: 'completed' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalNet: { $sum: '$netAmount' },
            settled: {
              $sum: { $cond: [{ $ifNull: ['$settledAt', false] }, '$netAmount', 0] },
            },
            unsettled: {
              $sum: { $cond: [{ $not: { $ifNull: ['$settledAt', false] } }, '$netAmount', 0] },
            },
          },
        },
      ]),
      SettlementModel.aggregate([
        { $match: { ...match, status: 'completed' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalNet: { $sum: '$netAmount' },
          },
        },
      ]),
    ]);

    const p = payments[0] ?? { count: 0, totalAmount: 0, totalFee: 0, totalGross: 0 };
    const t = transactions[0] ?? { count: 0, totalNet: 0, settled: 0, unsettled: 0 };
    const s = settlements[0] ?? { count: 0, totalNet: 0 };

    return {
      period: { startDate: query.startDate, endDate: query.endDate },
      revenue: {
        grossCollection: p.totalGross,
        platformFee: p.totalFee,
        netToSchool: p.totalAmount,
        paymentCount: p.count,
      },
      settlement: {
        totalSettled: s.totalNet,
        settlementCount: s.count,
        pendingSettlement: t.unsettled,
      },
      balance: {
        totalNet: t.totalNet,
        settled: t.settled,
        unsettled: t.unsettled,
      },
    };
  }

  // ── Export CSV ─────────────────────────────────────────────────────────────

  async exportPaymentsCSV(query: DateRangeQuery): Promise<string> {
    const match: Record<string, unknown> = {};
    if (query.schoolId) match.schoolId = toOid(query.schoolId);
    const df = dateFilter(query.startDate, query.endDate);
    if (df) match.createdAt = df;

    const payments = await PaymentModel.find(match)
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean();

    const header = [
      'ID',
      'External ID',
      'Amount',
      'Admin Fee',
      'Total Amount',
      'Status',
      'Method',
      'Provider',
      'Payer Name',
      'Payer Email',
      'Created At',
      'Paid At',
    ].join(',');

    const rows = payments.map((p: Record<string, unknown>) =>
      [
        p._id,
        p.externalId,
        p.amount,
        p.adminFee,
        p.totalAmount,
        p.status,
        p.method,
        p.provider,
        `"${p.payerName ?? ''}"`,
        p.payerEmail ?? '',
        p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
        p.paidAt instanceof Date ? (p.paidAt as Date).toISOString() : (p.paidAt ?? ''),
      ].join(','),
    );

    return [header, ...rows].join('\n');
  }

  async exportBillsCSV(query: DateRangeQuery): Promise<string> {
    const match: Record<string, unknown> = {};
    if (query.schoolId) match.schoolId = toOid(query.schoolId);
    if (query.academicYear) match.academicYear = query.academicYear;
    if (query.year) match.year = query.year;
    if (query.month) match.month = query.month;

    const bills = await BillModel.find(match)
      .sort({ year: 1, month: 1 })
      .limit(10000)
      .lean();

    const header = [
      'ID',
      'Student ID',
      'Academic Year',
      'Month',
      'Year',
      'Amount',
      'Status',
      'Due Date',
      'Paid At',
    ].join(',');

    const rows = bills.map((b: Record<string, unknown>) =>
      [
        b._id,
        b.studentId,
        b.academicYear,
        b.month,
        b.year,
        b.amount,
        b.status,
        b.dueDate instanceof Date ? b.dueDate.toISOString().slice(0, 10) : b.dueDate,
        b.paidAt instanceof Date ? (b.paidAt as Date).toISOString().slice(0, 10) : (b.paidAt ?? ''),
      ].join(','),
    );

    return [header, ...rows].join('\n');
  }
}
