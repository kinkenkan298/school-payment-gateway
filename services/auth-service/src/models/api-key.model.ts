import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKey extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  hashedKey: string;
  prefix: string;
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    hashedKey: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

apiKeySchema.index({ schoolId: 1 });

export const ApiKeyModel = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
