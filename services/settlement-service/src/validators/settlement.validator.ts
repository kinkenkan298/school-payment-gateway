import { z } from 'zod';

export const createSettlementSchema = z.object({
  schoolId: z.string().optional(),
  notes: z.string().optional(),
});

export const settlementQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  schoolId: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'partially_completed']).optional(),
  type: z.enum(['automatic', 'manual']).optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
});
