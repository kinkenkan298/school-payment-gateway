import { z } from 'zod';

export const createPaymentSchema = z.object({
  schoolId: z.string().min(1),
  studentId: z.string().min(1),
  billId: z.string().min(1),
  method: z.enum(['credit_card', 'bank_transfer', 'ewallet', 'qris', 'virtual_account']),
  provider: z.enum(['duitku', 'xendit', 'midtrans']),
  payerName: z.string().min(2).max(100),
  payerEmail: z.email().optional(),
  payerPhone: z.string().min(10).max(15).optional(),
});

export const paymentPaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  schoolId: z.string().optional(),
  studentId: z.string().optional(),
  billId: z.string().optional(),
  status: z
    .enum(['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded', 'expired'])
    .optional(),
  provider: z.enum(['duitku', 'xendit', 'midtrans', 'bank_direct']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type PaymentPaginationDto = z.infer<typeof paymentPaginationSchema>;
