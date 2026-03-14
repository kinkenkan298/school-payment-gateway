import mongoose, { Document, Schema } from 'mongoose';

export type SettlementStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'partially_completed';

export type SettlementType = 'automatic' | 'manual';

export interface ISettlement extends Document {
  batchId: string;
  schoolId: mongoose.Types.ObjectId;
  type: SettlementType;
  status: SettlementStatus;
  totalTransactions: number;
  grossAmount: number;
  totalFee: number;
  netAmount: number;
  currency: string;
  transactionIds: mongoose.Types.ObjectId[];
  bankAccountNumber: string;
  bankAccountName: string;
  bankName: string;
  transferReference?: string;
  periodStart: Date;
  periodEnd: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedReason?: string;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const settlementSchema = new Schema<ISettlement>(
  {
    batchId: {
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
    type: {
      type: String,
      enum: ['automatic', 'manual'],
      default: 'automatic',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'partially_completed'],
      default: 'pending',
    },
    totalTransactions: {
      type: Number,
      required: true,
      default: 0,
    },
    grossAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalFee: {
      type: Number,
      required: true,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: 'IDR',
    },
    transactionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    bankAccountNumber: {
      type: String,
      required: true,
    },
    bankAccountName: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    transferReference: {
      type: String,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    processedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    failedReason: {
      type: String,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'settlements',
  },
);

settlementSchema.index({ schoolId: 1, status: 1 });
settlementSchema.index({ schoolId: 1, createdAt: -1 });
settlementSchema.index({ status: 1, createdAt: -1 });
settlementSchema.index({ periodStart: 1, periodEnd: 1, schoolId: 1 });

export const Settlement = mongoose.model<ISettlement>('Settlement', settlementSchema);
