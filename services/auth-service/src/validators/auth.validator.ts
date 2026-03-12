import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password harus mengandung huruf besar, huruf kecil, dan angka',
  );

export const registerParentSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: passwordSchema,
  phone: z.string().min(10).max(15),
});

export const registerSchoolAdminSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: passwordSchema,
  phone: z.string().min(10).max(15),
  schoolId: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  expiresAt: z.iso.datetime().optional(),
});

export type RegisterParentDto = z.infer<typeof registerParentSchema>;
export type RegisterSchoolAdminDto = z.infer<typeof registerSchoolAdminSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type CreateApiKeyDto = z.infer<typeof createApiKeySchema>;
