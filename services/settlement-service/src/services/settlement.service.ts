import mongoose from 'mongoose';
import axios from 'axios';
import {
  createLogger,
  publishEvent,
  EXCHANGES,
  buildPaginationMeta,
} from '@school-payment-gateway/shared-lib';
import { Settlement, ISettlement } from '@/models/settlement.model';
import { generateBatchId } from '@/utils/settlement.utils';
import { env } from '@/config';

const logger = createLogger('settlement-service');

export const ERROR_CODES = {
  SETTLEMENT_NOT_FOUND: 'SETTLEMENT_NOT_FOUND',
  SCHOOL_NOT_FOUND: 'SCHOOL_NOT_FOUND',
  SCHOOL_BANK_NOT_CONFIGURED: 'SCHOOL_BANK_NOT_CONFIGURED',
  NO_TRANSACTIONS_TO_SETTLE: 'NO_TRANSACTIONS_TO_SETTLE',
  SETTLEMENT_ALREADY_PROCESSING: 'SETTLEMENT_ALREADY_PROCESSING',
  BELOW_MINIMUM_AMOUNT: 'BELOW_MINIMUM_AMOUNT',
} as const;

export interface UnsettledSummary {
  schoolId: string;
  totalTransactions: number;
  grossAmount: number;
  totalFee: number;
  netAmount: number;
  transactionIds: string[];
}

export interface SettlementQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export class SettlementService {
  // Ambil ringkasan transaksi yang belum di-settle dari transaction-service
  private async getUnsettledTransactions(schoolId: string): Promise<UnsettledSummary | null> {
    try {
      const response = await axios.get(
        `${env.TRANSACTION_SERVICE_URL}/transactions?schoolId=${schoolId}&type=payment&status=completed&page=1&limit=1000`,
        { headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET } },
      );

      const transactions: Array<{
        _id: string;
        amount: number;
        fee: number;
        netAmount: number;
        settledAt?: string;
      }> = response.data.data ?? [];

      const unsettled = transactions.filter((t) => !t.settledAt);

      if (unsettled.length === 0) return null;

      const grossAmount = unsettled.reduce((sum, t) => sum + t.amount, 0);
      const totalFee = unsettled.reduce((sum, t) => sum + t.fee, 0);
      const netAmount = unsettled.reduce((sum, t) => sum + t.netAmount, 0);

      return {
        schoolId,
        totalTransactions: unsettled.length,
        grossAmount,
        totalFee,
        netAmount,
        transactionIds: unsettled.map((t) => t._id),
      };
    } catch (err) {
      logger.error({ err, schoolId }, 'Failed to fetch unsettled transactions');
      return null;
    }
  }

  // Ambil data bank sekolah dari school-service
  private async getSchoolBankInfo(schoolId: string): Promise<{
    bankAccountNumber: string;
    bankAccountName: string;
    bankName: string;
  } | null> {
    try {
      const response = await axios.get(`${env.SCHOOL_SERVICE_URL}/schools/${schoolId}`, {
        headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET },
      });
      const school = response.data.data;
      if (!school?.bankAccountNumber) return null;
      return {
        bankAccountNumber: school.bankAccountNumber,
        bankAccountName: school.bankAccountName,
        bankName: school.bankName,
      };
    } catch (err) {
      logger.error({ err, schoolId }, 'Failed to fetch school bank info');
      return null;
    }
  }

  // Mock transfer bank — di production diganti dengan integrasi bank API
  private async executeBankTransfer(params: {
    bankAccountNumber: string;
    bankAccountName: string;
    bankName: string;
    amount: number;
    reference: string;
  }): Promise<string> {
    logger.info(
      {
        bankAccountNumber: params.bankAccountNumber,
        bankName: params.bankName,
        amount: params.amount,
        reference: params.reference,
      },
      'Executing bank transfer (mock)',
    );

    // Simulasi delay transfer
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Return transfer reference dari bank (mock)
    return `BANK-TRF-${Date.now()}-${params.reference.slice(-6)}`;
  }

  // Notify transaction-service bahwa transaksi sudah di-settle
  private async markTransactionsAsSettled(
    transactionIds: string[],
    settlementBatchId: string,
  ): Promise<void> {
    try {
      await axios.patch(
        `${env.TRANSACTION_SERVICE_URL}/transactions/settle`,
        { transactionIds, settlementBatchId },
        { headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET } },
      );
    } catch (err) {
      logger.error({ err, settlementBatchId }, 'Failed to mark transactions as settled');
      throw err;
    }
  }

  async createSettlement(schoolId: string, createdBy?: string): Promise<ISettlement> {
    // Cek apakah ada settlement yang sedang berjalan
    const existing = await Settlement.findOne({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      status: { $in: ['pending', 'processing'] },
    });

    if (existing) throw new Error(ERROR_CODES.SETTLEMENT_ALREADY_PROCESSING);

    // Ambil data bank sekolah
    const bankInfo = await this.getSchoolBankInfo(schoolId);
    if (!bankInfo) throw new Error(ERROR_CODES.SCHOOL_BANK_NOT_CONFIGURED);

    // Ambil transaksi yang belum di-settle
    const summary = await this.getUnsettledTransactions(schoolId);
    if (!summary) throw new Error(ERROR_CODES.NO_TRANSACTIONS_TO_SETTLE);

    if (summary.netAmount < env.SETTLEMENT_MINIMUM_AMOUNT) {
      throw new Error(ERROR_CODES.BELOW_MINIMUM_AMOUNT);
    }

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // awal bulan ini
    const batchId = generateBatchId(schoolId);

    const settlement = await Settlement.create({
      batchId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      type: 'manual',
      status: 'pending',
      totalTransactions: summary.totalTransactions,
      grossAmount: summary.grossAmount,
      totalFee: summary.totalFee,
      netAmount: summary.netAmount,
      currency: 'IDR',
      transactionIds: summary.transactionIds.map((id) => new mongoose.Types.ObjectId(id)),
      bankAccountNumber: bankInfo.bankAccountNumber,
      bankAccountName: bankInfo.bankAccountName,
      bankName: bankInfo.bankName,
      periodStart,
      periodEnd: now,
      ...(createdBy && { createdBy: new mongoose.Types.ObjectId(createdBy) }),
    });

    logger.info({ batchId, schoolId, netAmount: summary.netAmount }, 'Settlement created');

    // Langsung proses
    await this.processSettlement(settlement._id.toString());

    return (await Settlement.findById(settlement._id))!;
  }

  async processSettlement(settlementId: string): Promise<void> {
    const settlement = await Settlement.findById(settlementId);
    if (!settlement) throw new Error(ERROR_CODES.SETTLEMENT_NOT_FOUND);

    await Settlement.findByIdAndUpdate(settlementId, {
      status: 'processing',
      processedAt: new Date(),
    });

    try {
      // Eksekusi transfer bank
      const transferRef = await this.executeBankTransfer({
        bankAccountNumber: settlement.bankAccountNumber,
        bankAccountName: settlement.bankAccountName,
        bankName: settlement.bankName,
        amount: settlement.netAmount,
        reference: settlement.batchId,
      });

      // Update transaksi sebagai settled
      const txnIds = settlement.transactionIds.map((id) => id.toString());
      await this.markTransactionsAsSettled(txnIds, settlement.batchId);

      // Update settlement sebagai completed
      await Settlement.findByIdAndUpdate(settlementId, {
        status: 'completed',
        transferReference: transferRef,
        completedAt: new Date(),
      });

      logger.info(
        { batchId: settlement.batchId, transferRef, amount: settlement.netAmount },
        'Settlement completed',
      );

      // Publish event
      await publishEvent(EXCHANGES.SETTLEMENT, 'settlement.completed', {
        settlementId: settlement._id.toString(),
        batchId: settlement.batchId,
        schoolId: settlement.schoolId.toString(),
        netAmount: settlement.netAmount,
        totalTransactions: settlement.totalTransactions,
        transferReference: transferRef,
        completedAt: new Date(),
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Unknown error';
      await Settlement.findByIdAndUpdate(settlementId, {
        status: 'failed',
        failedReason: reason,
      });

      logger.error({ err, batchId: settlement.batchId }, 'Settlement processing failed');
      throw err;
    }
  }

  // Settlement otomatis semua sekolah — dipanggil oleh scheduler
  async runAutomaticSettlement(): Promise<{ processed: number; failed: number }> {
    logger.info('Running automatic settlement for all schools');

    // Ambil semua sekolah yang punya transaksi belum settled
    // Untuk simplifikasi, kita query lewat settlement history atau school-service
    // Di production, gunakan dedicated query ke transaction aggregation
    const schoolsWithBalance = await this.getSchoolsWithUnsettledBalance();

    let processed = 0;
    let failed = 0;

    for (const schoolId of schoolsWithBalance) {
      try {
        const bankInfo = await this.getSchoolBankInfo(schoolId);
        if (!bankInfo) {
          logger.warn({ schoolId }, 'Skipping school — bank info not configured');
          failed++;
          continue;
        }

        const summary = await this.getUnsettledTransactions(schoolId);
        if (!summary || summary.netAmount < env.SETTLEMENT_MINIMUM_AMOUNT) {
          logger.info({ schoolId, netAmount: summary?.netAmount }, 'Skipping — below minimum');
          continue;
        }

        const existing = await Settlement.findOne({
          schoolId: new mongoose.Types.ObjectId(schoolId),
          status: { $in: ['pending', 'processing'] },
        });
        if (existing) continue;

        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const batchId = generateBatchId(schoolId);

        const settlement = await Settlement.create({
          batchId,
          schoolId: new mongoose.Types.ObjectId(schoolId),
          type: 'automatic',
          status: 'pending',
          totalTransactions: summary.totalTransactions,
          grossAmount: summary.grossAmount,
          totalFee: summary.totalFee,
          netAmount: summary.netAmount,
          currency: 'IDR',
          transactionIds: summary.transactionIds.map((id) => new mongoose.Types.ObjectId(id)),
          bankAccountNumber: bankInfo.bankAccountNumber,
          bankAccountName: bankInfo.bankAccountName,
          bankName: bankInfo.bankName,
          periodStart,
          periodEnd: now,
        });

        await this.processSettlement(settlement._id.toString());
        processed++;
      } catch (err) {
        logger.error({ err, schoolId }, 'Auto settlement failed for school');
        failed++;
      }
    }

    logger.info({ processed, failed }, 'Automatic settlement run completed');
    return { processed, failed };
  }

  private async getSchoolsWithUnsettledBalance(): Promise<string[]> {
    // Query sekolah-sekolah yang punya settlement history
    // sebagai proxy untuk sekolah aktif — di production lebih baik pakai dedicated endpoint
    const settlements = await Settlement.aggregate([
      { $group: { _id: '$schoolId' } },
    ]);
    return settlements.map((s) => s._id.toString());
  }

  async getSettlements(query: SettlementQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.schoolId) filter.schoolId = new mongoose.Types.ObjectId(query.schoolId);
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;

    if (query.startDate || query.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (query.startDate) dateFilter.$gte = new Date(query.startDate);
      if (query.endDate) dateFilter.$lte = new Date(query.endDate);
      filter.createdAt = dateFilter;
    }

    const [data, total] = await Promise.all([
      Settlement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Settlement.countDocuments(filter),
    ]);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getSettlementById(id: string): Promise<ISettlement> {
    const settlement = await Settlement.findById(id).lean();
    if (!settlement) throw new Error(ERROR_CODES.SETTLEMENT_NOT_FOUND);
    return settlement as ISettlement;
  }

  async getSettlementByBatchId(batchId: string): Promise<ISettlement> {
    const settlement = await Settlement.findOne({ batchId }).lean();
    if (!settlement) throw new Error(ERROR_CODES.SETTLEMENT_NOT_FOUND);
    return settlement as ISettlement;
  }

  async getStats(schoolId?: string) {
    const match: Record<string, unknown> = {};
    if (schoolId) match.schoolId = new mongoose.Types.ObjectId(schoolId);

    const [byStatus, byType, totals, monthly] = await Promise.all([
      Settlement.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 }, totalNet: { $sum: '$netAmount' } } },
      ]),
      Settlement.aggregate([
        { $match: match },
        { $group: { _id: '$type', count: { $sum: 1 }, totalNet: { $sum: '$netAmount' } } },
      ]),
      Settlement.aggregate([
        { $match: { ...match, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalSettled: { $sum: 1 },
            totalGross: { $sum: '$grossAmount' },
            totalFee: { $sum: '$totalFee' },
            totalNet: { $sum: '$netAmount' },
          },
        },
      ]),
      Settlement.aggregate([
        { $match: { ...match, status: 'completed' } },
        {
          $group: {
            _id: { year: { $year: '$completedAt' }, month: { $month: '$completedAt' } },
            count: { $sum: 1 },
            totalNet: { $sum: '$netAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    return {
      byStatus,
      byType,
      totals: totals[0] ?? { totalSettled: 0, totalGross: 0, totalFee: 0, totalNet: 0 },
      monthly,
    };
  }

  async retrySettlement(settlementId: string): Promise<ISettlement> {
    const settlement = await Settlement.findById(settlementId);
    if (!settlement) throw new Error(ERROR_CODES.SETTLEMENT_NOT_FOUND);

    if (settlement.status !== 'failed') {
      throw new Error('Hanya settlement dengan status failed yang bisa di-retry');
    }

    await Settlement.findByIdAndUpdate(settlementId, {
      status: 'pending',
      failedReason: undefined,
    });

    await this.processSettlement(settlementId);

    return (await Settlement.findById(settlementId))!;
  }
}
