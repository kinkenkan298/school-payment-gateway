import mongoose, { Document, Schema } from 'mongoose';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type FraudAlertStatus = 'open' | 'reviewing' | 'resolved' | 'false_positive';

export interface IFraudAlert extends Document {
  alertId: string;
  paymentId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  status: FraudAlertStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNote?: string;
  metadata?: Record<string, unknown>;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const fraudAlertSchema = new Schema<IFraudAlert>(
  {
    alertId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    reasons: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'reviewing', 'resolved', 'false_positive'],
      default: 'open',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String },
    metadata: { type: Schema.Types.Mixed },
    resolvedAt: { type: Date },
  },
  { timestamps: true, collection: 'fraud_alerts' },
);

fraudAlertSchema.index({ schoolId: 1, status: 1 });
fraudAlertSchema.index({ riskLevel: 1, status: 1 });
fraudAlertSchema.index({ paymentId: 1 });
fraudAlertSchema.index({ createdAt: -1 });

export const FraudAlert = mongoose.model<IFraudAlert>('FraudAlert', fraudAlertSchema);
