import mongoose, { Document, Schema } from 'mongoose';

export type TokenType = 'refresh' | 'email_verification' | 'password_reset';

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  type: TokenType;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['refresh', 'email_verification', 'password_reset'],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenModel = mongoose.model<IToken>('Token', tokenSchema);
