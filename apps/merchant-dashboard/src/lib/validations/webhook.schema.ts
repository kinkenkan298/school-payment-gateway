import { z } from 'zod';

const WEBHOOK_EVENTS = [
  'payment.success',
  'payment.failed',
  'payment.expired',
  'payment.refunded',
  'settlement.completed',
  'payout.success',
  'payout.failed',
] as const;

export const webhookSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama webhook wajib diisi')
    .max(100, 'Nama terlalu panjang'),
  url: z
    .string()
    .min(1, 'URL webhook wajib diisi')
    .url('Format URL tidak valid')
    .startsWith('https://', 'URL harus menggunakan HTTPS'),
  events: z
    .array(z.enum(WEBHOOK_EVENTS))
    .min(1, 'Pilih minimal 1 event'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type WebhookInput = z.infer<typeof webhookSchema>;
export { WEBHOOK_EVENTS };
