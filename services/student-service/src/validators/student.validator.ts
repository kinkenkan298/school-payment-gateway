import { z } from 'zod';

const academicYearRegex = /^\d{4}\/\d{4}$/;

export const createStudentSchema = z.object({
  nis: z.string().min(1).max(20),
  nisn: z.string().length(10, 'NISN harus 10 digit'),
  name: z.string().min(2).max(100),
  className: z.string().min(1).max(20),
  grade: z.number().int().min(1).max(12),
  academicYear: z.string().regex(academicYearRegex, 'Format tahun ajaran: 2024/2025'),
  parentName: z.string().min(2).max(100),
  parentPhone: z.string().min(10).max(15),
  parentEmail: z.email().optional(),
});

export const updateStudentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  className: z.string().min(1).max(20).optional(),
  grade: z.number().int().min(1).max(12).optional(),
  parentName: z.string().min(2).max(100).optional(),
  parentPhone: z.string().min(10).max(15).optional(),
  parentEmail: z.email().optional(),
  status: z.enum(['active', 'inactive', 'graduated', 'transferred']).optional(),
});

export const createSPPBillSchema = z.object({
  studentId: z.string().min(1),
  academicYear: z.string().regex(academicYearRegex),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2099),
  amount: z.number().min(0),
  dueDate: z.iso.datetime(),
});

export const bulkCreateSPPBillSchema = z.object({
  academicYear: z.string().regex(academicYearRegex),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2099),
  amount: z.number().min(0),
  dueDate: z.iso.datetime(),
  gradeFilter: z.number().int().min(1).max(12).optional(), // kalau kosong = semua grade
});

export const studentPaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  search: z.string().optional(),
  grade: z.string().regex(/^\d+$/).transform(Number).optional(),
  className: z.string().optional(),
  academicYear: z.string().optional(),
  status: z.enum(['active', 'inactive', 'graduated', 'transferred']).optional(),
});

export const billPaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  studentId: z.string().optional(),
  academicYear: z.string().optional(),
  month: z.string().regex(/^\d+$/).transform(Number).optional(),
  year: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.enum(['unpaid', 'pending', 'paid', 'overdue', 'waived']).optional(),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
export type CreateSPPBillDto = z.infer<typeof createSPPBillSchema>;
export type BulkCreateSPPBillDto = z.infer<typeof bulkCreateSPPBillSchema>;
export type StudentPaginationDto = z.infer<typeof studentPaginationSchema>;
export type BillPaginationDto = z.infer<typeof billPaginationSchema>;
