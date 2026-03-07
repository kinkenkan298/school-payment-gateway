export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred';
export type ImportStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface Student {
  id: string;
  schoolId: string;
  nis: string; // Nomor Induk Siswa
  nisn: string; // Nomor Induk Siswa Nasional
  name: string;
  className: string;
  grade: number; // 1-6 SD, 7-9 SMP, 10-12 SMA/SMK
  academicYear: string; // e.g. "2024/2025"
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SPPBill {
  id: string;
  schoolId: string;
  studentId: string;
  academicYear: string;
  month: number; // 1-12
  year: number;
  amount: number;
  dueDate: Date;
  status: SPPBillStatus;
  paidAt?: Date;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SPPBillStatus = 'unpaid' | 'pending' | 'paid' | 'overdue' | 'waived';

export interface StudentImport {
  id: string;
  schoolId: string;
  fileName: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  status: ImportStatus;
  errors?: ImportError[];
  createdAt: Date;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}
