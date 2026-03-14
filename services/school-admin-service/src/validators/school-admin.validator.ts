import { z } from 'zod';

export const approveKycSchema = z.object({
  note: z.string().optional(),
});

export const rejectKycSchema = z.object({
  reason: z.string().min(10, 'Alasan penolakan minimal 10 karakter'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
  note: z.string().optional(),
});

export const upsertConfigSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9_.]+$/, 'Key hanya boleh berisi huruf kecil, angka, titik, dan underscore'),
  value: z.unknown(),
  description: z.string().optional(),
});
