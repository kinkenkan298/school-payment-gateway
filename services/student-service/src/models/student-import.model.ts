import mongoose, { Document, Schema } from 'mongoose';
import { ImportStatus, ImportError } from '@school-payment-gateway/types';

export interface IStudentImport extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  importedBy: mongoose.Types.ObjectId;
  fileName: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  status: ImportStatus;
  importErrors: ImportError[];
  createdAt: Date;
  updatedAt: Date;
}

const studentImportSchema = new Schema<IStudentImport>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    importedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    totalRows: { type: Number, default: 0 },
    successRows: { type: Number, default: 0 },
    failedRows: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed'],
      default: 'pending',
    },
    importErrors: [
      {
        row: { type: Number },
        field: { type: String },
        message: { type: String },
      },
    ],
  },
  { timestamps: true },
);

studentImportSchema.index({ schoolId: 1 });

export const StudentImportModel = mongoose.model<IStudentImport>(
  'StudentImport',
  studentImportSchema,
);
