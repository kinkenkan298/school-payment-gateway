import mongoose from 'mongoose';
import {
  createLogger,
  publishEvent,
  EXCHANGES,
  buildPaginationMeta,
} from '@school-payment-gateway/shared-lib';
import { Transaction, ITransaction } from '@/models/transaction.model';
import { generateReference } from '@/utils/transaction.utils';

const logger = createLogger('transaction-service');

export const ERROR_CODES = {
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  PAYMENT_ALREADY_RECORDED: 'PAYMENT_ALREADY_RECORDED',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
} as const;

export interface CreateTransactionFromPaymentDto {
  paymentId: string;
  schoolId: string;
  studentId: string;
  billId: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  provider: string;
  workflow: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  studentId?: string;
  billId?: string;
  paymentId?: string;
  type?: string;
  status?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
}

export class TransactionService {
  async createFromPayment(dto: CreateTransactionFromPaymentDto): Promise<ITransaction[]> {
    const existing = await Transaction.findOne({
      paymentId: new mongoose.Types.ObjectId(dto.paymentId),
      type: 'payment',
    });

    if (existing) {
      logger.warn({ paymentId: dto.paymentId }, 'Payment already recorded as transaction');
      throw new Error(ERROR_CODES.PAYMENT_ALREADY_RECORDED);
    }

    const schoolOid = new mongoose.Types.ObjectId(dto.schoolId);
    const studentOid = new mongoose.Types.ObjectId(dto.studentId);
    const billOid = new mongoose.Types.ObjectId(dto.billId);
    const paymentOid = new mongoose.Types.ObjectId(dto.paymentId);

    const paymentTxn = new Transaction({
      reference: generateReference(dto.schoolId, 'payment'),
      schoolId: schoolOid,
      studentId: studentOid,
      billId: billOid,
      paymentId: paymentOid,
      type: 'payment',
      amount: dto.totalAmount,
      fee: 0,
      netAmount: dto.totalAmount,
      currency: 'IDR',
      status: 'completed',
      provider: dto.provider,
      workflow: dto.workflow,
      description: dto.description ?? `Pembayaran SPP`,
      metadata: dto.metadata,
    });

    const feeTxn = new Transaction({
      reference: generateReference(dto.schoolId, 'fee'),
      schoolId: schoolOid,
      studentId: studentOid,
      billId: billOid,
      paymentId: paymentOid,
      type: 'fee',
      amount: dto.adminFee,
      fee: dto.adminFee,
      netAmount: 0,
      currency: 'IDR',
      status: 'completed',
      provider: dto.provider,
      workflow: dto.workflow,
      description: `Platform fee untuk ${paymentTxn.reference}`,
      metadata: dto.metadata,
    });

    await Transaction.insertMany([paymentTxn, feeTxn]);

    logger.info(
      { paymentId: dto.paymentId, refs: [paymentTxn.reference, feeTxn.reference] },
      'Transactions created',
    );

    await publishEvent(EXCHANGES.SETTLEMENT, 'transaction.created', {
      transactionId: paymentTxn._id,
      reference: paymentTxn.reference,
      schoolId: dto.schoolId,
      amount: dto.totalAmount,
      adminFee: dto.adminFee,
      netAmount: dto.totalAmount - dto.adminFee,
      provider: dto.provider,
      workflow: dto.workflow,
    });

    return [paymentTxn, feeTxn];
  }

  async createRefund(paymentId: string, schoolId: string, reason: string): Promise<ITransaction> {
    const originalTxn = await Transaction.findOne({
      paymentId: new mongoose.Types.ObjectId(paymentId),
      type: 'payment',
    });

    if (!originalTxn) {
      throw new Error(ERROR_CODES.TRANSACTION_NOT_FOUND);
    }

    if (originalTxn.status === 'reversed') {
      throw new Error(ERROR_CODES.INVALID_STATUS_TRANSITION);
    }

    const refundTxn = new Transaction({
      reference: generateReference(schoolId, 'refund'),
      schoolId: originalTxn.schoolId,
      studentId: originalTxn.studentId,
      billId: originalTxn.billId,
      paymentId: originalTxn.paymentId,
      type: 'refund',
      amount: originalTxn.amount,
      fee: 0,
      netAmount: originalTxn.amount,
      currency: 'IDR',
      status: 'completed',
      provider: originalTxn.provider,
      workflow: originalTxn.workflow,
      description: `Refund untuk ${originalTxn.reference}: ${reason}`,
      metadata: { originalReference: originalTxn.reference, reason },
    });

    await refundTxn.save();

    await Transaction.updateMany(
      { paymentId: new mongoose.Types.ObjectId(paymentId) },
      { $set: { status: 'reversed' } },
    );

    logger.info(
      { paymentId, refundRef: refundTxn.reference },
      'Refund transaction created',
    );

    return refundTxn;
  }

  async markAsSettled(
    transactionIds: string[],
    settlementBatchId: string,
  ): Promise<void> {
    await Transaction.updateMany(
      {
        _id: { $in: transactionIds.map((id) => new mongoose.Types.ObjectId(id)) },
        type: 'payment',
        status: 'completed',
        settledAt: { $exists: false },
      },
      {
        $set: {
          settledAt: new Date(),
          settlementBatchId,
        },
      },
    );

    logger.info({ settlementBatchId, count: transactionIds.length }, 'Transactions marked as settled');
  }

  async getTransactions(query: TransactionQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.schoolId) filter.schoolId = new mongoose.Types.ObjectId(query.schoolId);
    if (query.studentId) filter.studentId = new mongoose.Types.ObjectId(query.studentId);
    if (query.billId) filter.billId = new mongoose.Types.ObjectId(query.billId);
    if (query.paymentId) filter.paymentId = new mongoose.Types.ObjectId(query.paymentId);
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.provider) filter.provider = query.provider;

    if (query.startDate || query.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (query.startDate) dateFilter.$gte = new Date(query.startDate);
      if (query.endDate) dateFilter.$lte = new Date(query.endDate);
      filter.createdAt = dateFilter;
    }

    const [data, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(filter),
    ]);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getTransactionById(id: string): Promise<ITransaction> {
    const txn = await Transaction.findById(id).lean();
    if (!txn) throw new Error(ERROR_CODES.TRANSACTION_NOT_FOUND);
    return txn as ITransaction;
  }

  async getBalance(schoolId: string): Promise<{
    totalAmount: number;
    totalFee: number;
    netAmount: number;
    unsettledAmount: number;
    unsettledCount: number;
  }> {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    const [totals, unsettled] = await Promise.all([
      Transaction.aggregate([
        { $match: { schoolId: schoolOid, type: 'payment', status: 'completed' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            type: 'payment',
            status: 'completed',
            settledAt: { $exists: false },
          },
        },
        {
          $group: {
            _id: null,
            unsettledAmount: { $sum: '$netAmount' },
            unsettledCount: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { schoolId: schoolOid, type: 'fee', status: 'completed' } },
        { $group: { _id: null, totalFee: { $sum: '$fee' } } },
      ]),
    ]);

    const totalAmount = totals[0]?.totalAmount ?? 0;
    const totalFee = (
      await Transaction.aggregate([
        { $match: { schoolId: schoolOid, type: 'fee', status: 'completed' } },
        { $group: { _id: null, totalFee: { $sum: '$fee' } } },
      ])
    )[0]?.totalFee ?? 0;

    return {
      totalAmount,
      totalFee,
      netAmount: totalAmount - totalFee,
      unsettledAmount: unsettled[0]?.unsettledAmount ?? 0,
      unsettledCount: unsettled[0]?.unsettledCount ?? 0,
    };
  }

  async getStats(schoolId: string, startDate?: string, endDate?: string) {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    const dateFilter: Record<string, Date> = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchBase: Record<string, unknown> = { schoolId: schoolOid };
    if (startDate || endDate) matchBase.createdAt = dateFilter;

    const [byType, byProvider, byStatus, daily] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...matchBase, status: 'completed' } },
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
      Transaction.aggregate([
        { $match: { ...matchBase, type: 'payment', status: 'completed' } },
        {
          $group: {
            _id: '$provider',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: matchBase },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { ...matchBase, type: 'payment', status: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
    ]);

    return { byType, byProvider, byStatus, daily };
  }

  async reconcile(schoolId: string, startDate: string, endDate: string) {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    const result = await Transaction.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          type: 'payment',
          status: 'completed',
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalFee: { $sum: '$fee' },
          netAmount: { $sum: '$netAmount' },
          paymentIds: { $addToSet: '$paymentId' },
        },
      },
    ]);

    const feeResult = await Transaction.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          type: 'fee',
          status: 'completed',
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalFeeRecords: { $sum: 1 },
          totalFeeAmount: { $sum: '$fee' },
        },
      },
    ]);

    const summary = result[0] ?? {
      totalTransactions: 0,
      totalAmount: 0,
      totalFee: 0,
      netAmount: 0,
      paymentIds: [],
    };

    const feeSummary = feeResult[0] ?? { totalFeeRecords: 0, totalFeeAmount: 0 };

    const isConsistent =
      summary.totalTransactions === feeSummary.totalFeeRecords;

    return {
      period: { startDate, endDate },
      summary: {
        totalPaymentTransactions: summary.totalTransactions,
        totalFeeTransactions: feeSummary.totalFeeRecords,
        totalAmount: summary.totalAmount,
        totalFee: feeSummary.totalFeeAmount,
        netAmount: summary.totalAmount - feeSummary.totalFeeAmount,
        uniquePayments: summary.paymentIds?.length ?? 0,
      },
      isConsistent,
      discrepancy: isConsistent
        ? null
        : `Payment transactions (${summary.totalTransactions}) != Fee transactions (${feeSummary.totalFeeRecords})`,
    };
  }
}
