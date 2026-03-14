import mongoose, { Document, Schema } from 'mongoose';

export type AuditAction =
  | 'school.kyc_approved'
  | 'school.kyc_rejected'
  | 'school.activated'
  | 'school.suspended'
  | 'school.deactivated'
  | 'school.created'
  | 'school.updated'
  | 'user.created'
  | 'user.deactivated'
  | 'user.role_changed'
  | 'platform.config_updated';

export interface IAuditLog extends Document {
  action: AuditAction;
  performedBy: mongoose.Types.ObjectId;
  targetType: 'school' | 'user' | 'platform';
  targetId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  note?: string;
  ip?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['school', 'user', 'platform'], required: true },
    targetId: { type: String, required: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    note: { type: String },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'audit_logs' },
);

auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
