import { z } from 'zod';

export const transactionFilterSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['all', 'success', 'pending', 'failed', 'expired', 'refunded'])
    .default('all'),
  method: z
    .enum(['all', 'virtual_account', 'qris', 'ewallet', 'bank_transfer'])
    .default('all'),
  workflow: z
    .enum(['all', 'provider_to_platform', 'provider_to_merchant', 'h2h'])
    .default('all'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
