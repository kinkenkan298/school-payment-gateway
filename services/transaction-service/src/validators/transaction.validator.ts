import { z } from 'zod';

export const transactionQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
  schoolId: z.string().optional(),
  studentId: z.string().optional(),
  billId: z.string().optional(),
  paymentId: z.string().optional(),
  type: z.enum(['payment', 'refund', 'settlement', 'fee']).optional(),
  status: z.enum(['pending', 'completed', 'failed', 'reversed']).optional(),
  provider: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
});

export const createRefundSchema = z.object({
  paymentId: z.string().min(1, 'paymentId wajib diisi'),
  reason: z.string().min(5, 'Alasan refund minimal 5 karakter'),
});

export const reconcileSchema = z.object({
  schoolId: z.string().optional(),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
});

export const markSettledSchema = z.object({
  transactionIds: z.array(z.string().min(1)).min(1, 'Minimal 1 transaction ID'),
  settlementBatchId: z.string().min(1, 'settlementBatchId wajib diisi'),
});
