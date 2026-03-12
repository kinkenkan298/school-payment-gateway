import mongoose, { Document, Schema } from 'mongoose';

export type WebhookStatus = 'received' | 'processed' | 'failed' | 'duplicate';
export type WebhookProvider = 'duitku' | 'xendit' | 'midtrans';

export interface IWebhookLog extends Document {
  _id: mongoose.Types.ObjectId;
  provider: WebhookProvider;
  externalId: string;
  rawPayload: Record<string, unknown>;
  headers: Record<string, unknown>;
  status: WebhookStatus;
  failedReason?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const webhookLogSchema = new Schema<IWebhookLog>(
  {
    provider: {
      type: String,
      enum: ['duitku', 'xendit', 'midtrans'],
      required: true,
    },
    externalId: { type: String, required: true },
    rawPayload: { type: Schema.Types.Mixed, required: true },
    headers: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['received', 'processed', 'failed', 'duplicate'],
      default: 'received',
    },
    failedReason: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true },
);

// Index untuk deduplication
webhookLogSchema.index({ provider: 1, externalId: 1 });
webhookLogSchema.index({ status: 1 });
webhookLogSchema.index({ createdAt: 1 });

export const WebhookLogModel = mongoose.model<IWebhookLog>('WebhookLog', webhookLogSchema);
