import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformConfig extends Document {
  key: string;
  value: unknown;
  description?: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const platformConfigSchema = new Schema<IPlatformConfig>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'platform_configs' },
);

export const PlatformConfig = mongoose.model<IPlatformConfig>('PlatformConfig', platformConfigSchema);
