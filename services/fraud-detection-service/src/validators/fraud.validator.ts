import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['reviewing', 'resolved', 'false_positive']),
  note: z.string().optional(),
});
