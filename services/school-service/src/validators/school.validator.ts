import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.email(),
  phone: z.string().min(10).max(15),
  address: z.string().min(5),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().length(5, 'Kode pos harus 5 digit'),
  level: z.enum(['sd', 'smp', 'sma', 'smk']),
  npsn: z.string().length(8, 'NPSN harus 8 digit'),
  principalName: z.string().min(2).max(100),
});

export const updateSchoolSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.email().optional(),
  phone: z.string().min(10).max(15).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  province: z.string().min(2).optional(),
  postalCode: z.string().length(5).optional(),
  principalName: z.string().min(2).max(100).optional(),
  webhookUrl: z.url().optional(),
});

export const updateBankSchema = z.object({
  bankAccountNumber: z.string().min(10).max(20),
  bankAccountName: z.string().min(2).max(100),
  bankName: z.string().min(2).max(100),
});

export const updateKycSchema = z.object({
  kycStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  level: z.enum(['sd', 'smp', 'sma', 'smk']).optional(),
  province: z.string().optional(),
});

export type CreateSchoolDto = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolDto = z.infer<typeof updateSchoolSchema>;
export type UpdateBankDto = z.infer<typeof updateBankSchema>;
export type UpdateKycDto = z.infer<typeof updateKycSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
export type PaginationDto = z.infer<typeof paginationSchema>;
