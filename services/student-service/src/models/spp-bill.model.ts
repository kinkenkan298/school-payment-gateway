import mongoose, { Document, Schema } from 'mongoose';
import { SPPBillStatus } from '@school-payment-gateway/types';

export interface ISPPBill extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYear: string;
  month: number;
  year: number;
  amount: number;
  dueDate: Date;
  status: SPPBillStatus;
  paidAt?: Date;
  paymentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sppBillSchema = new Schema<ISPPBill>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYear: { type: String, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'overdue', 'waived'],
      default: 'unpaid',
    },
    paidAt: { type: Date },
    paymentId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

sppBillSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });
sppBillSchema.index({ schoolId: 1, status: 1 });
sppBillSchema.index({ schoolId: 1, academicYear: 1 });
sppBillSchema.index({ dueDate: 1, status: 1 });

export const SPPBillModel = mongoose.model<ISPPBill>('SPPBill', sppBillSchema);
