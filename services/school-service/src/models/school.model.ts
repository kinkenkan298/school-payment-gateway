import mongoose, { Document, Schema } from 'mongoose';
import { SchoolStatus, KycStatus, SchoolLevel } from '@school-payment-gateway/types';

export interface ISchool extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  level: SchoolLevel;
  npsn: string;
  principalName: string;
  status: SchoolStatus;
  kycStatus: KycStatus;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  logoUrl?: string;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    level: {
      type: String,
      enum: ['sd', 'smp', 'sma', 'smk'],
      required: true,
    },
    npsn: { type: String, required: true, unique: true, trim: true },
    principalName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'pending',
    },
    kycStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    bankAccountNumber: { type: String },
    bankAccountName: { type: String },
    bankName: { type: String },
    logoUrl: { type: String },
    webhookUrl: { type: String },
  },
  { timestamps: true },
);

schoolSchema.index({ status: 1 });
schoolSchema.index({ city: 1, province: 1 });

export const SchoolModel = mongoose.model<ISchool>('School', schoolSchema);
