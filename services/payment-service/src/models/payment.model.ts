import mongoose, { Document, Schema } from 'mongoose';
import {
  PaymentStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentWorkflow,
} from '@school-payment-gateway/types';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  billId: mongoose.Types.ObjectId;
  externalId: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: PaymentProvider;
  workflow: PaymentWorkflow;
  description: string;
  payerName: string;
  payerEmail?: string;
  payerPhone?: string;
  paymentUrl?: string;
  providerTransactionId?: string;
  providerResponse?: Record<string, unknown>;
  expiredAt: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    billId: { type: Schema.Types.ObjectId, ref: 'SPPBill', required: true },
    externalId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    adminFee: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'IDR' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded', 'expired'],
      default: 'pending',
    },
    method: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'ewallet', 'qris', 'virtual_account'],
      required: true,
    },
    provider: {
      type: String,
      enum: ['duitku', 'xendit', 'midtrans', 'bank_direct'],
      required: true,
    },
    workflow: {
      type: String,
      enum: ['provider_to_platform', 'platform_direct', 'bank_direct'],
      required: true,
    },
    description: { type: String, required: true },
    payerName: { type: String, required: true },
    payerEmail: { type: String },
    payerPhone: { type: String },
    paymentUrl: { type: String },
    providerTransactionId: { type: String },
    providerResponse: { type: Schema.Types.Mixed },
    expiredAt: { type: Date, required: true },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

paymentSchema.index({ schoolId: 1, status: 1 });
paymentSchema.index({ billId: 1 });
paymentSchema.index({ studentId: 1 });
paymentSchema.index({ expiredAt: 1, status: 1 });

export const PaymentModel = mongoose.model<IPayment>('Payment', paymentSchema);
