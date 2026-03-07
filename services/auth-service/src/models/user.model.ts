import mongoose, { Document, Schema } from 'mongoose';
import { Role, ROLES } from '@school-payment-gateway/shared-lib';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  schoolId?: mongoose.Types.ObjectId;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.PARENT,
    },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ schoolId: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);
