import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z
    .string()
    .min(1, 'Nomor telepon wajib diisi')
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor telepon tidak valid'),
  schoolName: z.string().min(1, 'Nama sekolah wajib diisi'),
  schoolLevel: z.enum(['TK', 'SD', 'SMP', 'SMA', 'SMK', 'MA', 'MTs', 'Perguruan Tinggi']),
  website: z.string().url('Format URL tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
});

export const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'Nama bank wajib diisi'),
  accountNumber: z
    .string()
    .min(1, 'Nomor rekening wajib diisi')
    .regex(/^\d{8,20}$/, 'Nomor rekening tidak valid'),
  accountName: z.string().min(1, 'Nama pemilik rekening wajib diisi'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Harus ada minimal 1 huruf kapital')
      .regex(/[0-9]/, 'Harus ada minimal 1 angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password tidak sama',
    path: ['confirmPassword'],
  });

export type ProfileInput = z.infer<typeof profileSchema>;
export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
