import { Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { successResponse, HTTP_STATUS, errorResponse } from '@school-payment-gateway/shared-lib';
import { AuthRequest } from '@/middlewares/auth.middleware';

const authService = new AuthService();

const ERROR_STATUS: Record<string, number> = {
  EMAIL_ALREADY_EXISTS: HTTP_STATUS.CONFLICT,
  INVALID_CREDENTIALS: HTTP_STATUS.UNAUTHORIZED,
  ACCOUNT_INACTIVE: HTTP_STATUS.FORBIDDEN,
  EMAIL_NOT_VERIFIED: HTTP_STATUS.FORBIDDEN,
  INVALID_REFRESH_TOKEN: HTTP_STATUS.UNAUTHORIZED,
  INVALID_VERIFICATION_TOKEN: HTTP_STATUS.BAD_REQUEST,
  INVALID_RESET_TOKEN: HTTP_STATUS.BAD_REQUEST,
  WRONG_CURRENT_PASSWORD: HTTP_STATUS.BAD_REQUEST,
  API_KEY_NOT_FOUND: HTTP_STATUS.NOT_FOUND,
};

const handleError = (err: unknown, res: Response): void => {
  const message = err instanceof Error ? err.message : 'Something went wrong';
  const status = ERROR_STATUS[message] ?? HTTP_STATUS.INTERNAL_ERROR;
  res.status(status).json(errorResponse(message));
};

export class AuthController {
  async registerParent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.registerParent(req.body);
      res
        .status(HTTP_STATUS.CREATED)
        .json(successResponse(user, 'Registrasi berhasil. Silakan cek email untuk verifikasi.'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async registerSchoolAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.registerSchoolAdmin(req.body);
      res
        .status(HTTP_STATUS.CREATED)
        .json(
          successResponse(
            user,
            'Registrasi admin sekolah berhasil. Silakan cek email untuk verifikasi.',
          ),
        );
    } catch (err) {
      handleError(err, res);
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(HTTP_STATUS.OK).json(successResponse(result, 'Login berhasil'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (err) {
      handleError(err, res);
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      await authService.logout(req.body.refreshToken);
      res.status(HTTP_STATUS.OK).json(successResponse(null, 'Logout berhasil'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async verifyEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      await authService.verifyEmail(req.query.token as string);
      res.status(HTTP_STATUS.OK).json(successResponse(null, 'Email berhasil diverifikasi'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async forgotPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      await authService.forgotPassword(req.body.email);
      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(null, 'Jika email terdaftar, link reset password telah dikirim'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async resetPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.status(HTTP_STATUS.OK).json(successResponse(null, 'Password berhasil direset'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      await authService.changePassword(req.user!.sub, req.body);
      res.status(HTTP_STATUS.OK).json(successResponse(null, 'Password berhasil diubah'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async createApiKey(req: AuthRequest, res: Response): Promise<void> {
    try {
      const rawKey = await authService.createApiKey(
        req.user!.sub,
        req.user!.schoolId as string,
        req.body,
      );
      res
        .status(HTTP_STATUS.CREATED)
        .json(
          successResponse(
            { key: rawKey },
            'API key berhasil dibuat. Simpan key ini, tidak akan ditampilkan lagi.',
          ),
        );
    } catch (err) {
      handleError(err, res);
    }
  }

  async revokeApiKey(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw new Error('API key ID is required');
      }
      await authService.revokeApiKey(req.params.id, req.user!.schoolId as string);
      res.status(HTTP_STATUS.OK).json(successResponse(null, 'API key berhasil dinonaktifkan'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async listApiKeys(req: AuthRequest, res: Response): Promise<void> {
    try {
      const keys = await authService.listApiKeys(req.user!.schoolId as string);
      res.status(HTTP_STATUS.OK).json(successResponse(keys));
    } catch (err) {
      handleError(err, res);
    }
  }
}
