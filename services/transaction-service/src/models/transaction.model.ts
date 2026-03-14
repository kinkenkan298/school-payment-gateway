import mongoose, { Document, Schema } from 'mongoose';

export type TransactionType = 'payment' | 'refund' | 'settlement' | 'fee';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface ITransaction extends Document {
  reference: string;
  schoolId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  billId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  status: TransactionStatus;
  provider: string;
  workflow: string;
  description: string;
  metadata?: Record<string, unknown>;
  settledAt?: Date;
  settlementBatchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    billId: {
      type: Schema.Types.ObjectId,
      ref: 'SPPBill',
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    type: {
      type: String,
      enum: ['payment', 'refund', 'settlement', 'fee'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    fee: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'IDR',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'reversed'],
      default: 'completed',
    },
    provider: {
      type: String,
      required: true,
    },
    workflow: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    settledAt: {
      type: Date,
    },
    settlementBatchId: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'transactions',
  },
);

transactionSchema.index({ schoolId: 1, status: 1 });
transactionSchema.index({ schoolId: 1, type: 1 });
transactionSchema.index({ schoolId: 1, createdAt: -1 });
transactionSchema.index({ paymentId: 1 });
transactionSchema.index({ billId: 1 });
transactionSchema.index({ studentId: 1 });
transactionSchema.index({ settlementBatchId: 1 }, { sparse: true });
transactionSchema.index({ settledAt: 1, status: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
