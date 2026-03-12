import mongoose, { Document, Schema } from 'mongoose';
import { StudentStatus } from '@school-payment-gateway/types';

export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  nis: string;
  nisn: string;
  name: string;
  className: string;
  grade: number;
  academicYear: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  fcmToken?: string;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    nis: { type: String, required: true, trim: true },
    nisn: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    grade: { type: Number, required: true, min: 1, max: 12 },
    academicYear: { type: String, required: true }, // e.g. "2024/2025"
    parentName: { type: String, required: true, trim: true },
    parentPhone: { type: String, required: true, trim: true },
    parentEmail: { type: String, lowercase: true, trim: true },
    fcmToken: { type: String }, // ← tambah ini
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'transferred'],
      default: 'active',
    },
  },
  { timestamps: true },
);

studentSchema.index({ schoolId: 1, nis: 1 }, { unique: true });
studentSchema.index({ schoolId: 1, nisn: 1 }, { unique: true });
studentSchema.index({ schoolId: 1, academicYear: 1 });
studentSchema.index({ schoolId: 1, grade: 1, className: 1 });

export const StudentModel = mongoose.model<IStudent>('Student', studentSchema);
