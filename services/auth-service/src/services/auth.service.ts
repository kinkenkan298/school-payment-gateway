import crypto from 'crypto';
import mongoose from 'mongoose';
import {
  createLogger,
  hashPassword,
  comparePassword,
  signJwt,
  generateApiKey,
  hashApiKey,
  ROLES,
} from '@school-payment-gateway/shared-lib';
import { UserModel } from '@/models/user.model';
import { TokenModel } from '@/models/token.model';
import { ApiKeyModel } from '@/models/api-key.model';
import { EmailService } from '@/services/email.service';
import {
  RegisterParentDto,
  RegisterSchoolAdminDto,
  LoginDto,
  ChangePasswordDto,
  CreateApiKeyDto,
} from '@/validators/auth.validator';
import { env } from '@/config';

const logger = createLogger('auth-service');

const ERROR_CODES = {
  EMAIL_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  INVALID_VERIFICATION_TOKEN: 'INVALID_VERIFICATION_TOKEN',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  WRONG_PASSWORD: 'WRONG_CURRENT_PASSWORD',
  API_KEY_NOT_FOUND: 'API_KEY_NOT_FOUND',
  SCHOOL_REQUIRED: 'SCHOOL_ID_REQUIRED',
} as const;

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // ── Register ────────────────────────────────────────────
  async registerParent(dto: RegisterParentDto) {
    const existing = await UserModel.findOne({ email: dto.email });
    if (existing) throw new Error(ERROR_CODES.EMAIL_EXISTS);

    const hashed = await hashPassword(dto.password);
    const user = await UserModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: ROLES.PARENT,
    });

    const token = crypto.randomBytes(32).toString('hex');
    await TokenModel.create({
      userId: user._id,
      token,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + env.EMAIL_VERIFICATION_EXPIRES_IN * 1000),
    });

    await this.emailService.sendVerificationEmail(user.email, user.name, token);

    logger.info({ userId: user._id.toString(), role: ROLES.PARENT }, 'User registered');
    return user;
  }

  async registerSchoolAdmin(dto: RegisterSchoolAdminDto) {
    const existing = await UserModel.findOne({ email: dto.email });
    if (existing) throw new Error(ERROR_CODES.EMAIL_EXISTS);

    const hashed = await hashPassword(dto.password);
    const user = await UserModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: ROLES.SCHOOL_ADMIN,
      schoolId: new mongoose.Types.ObjectId(dto.schoolId),
    });

    const token = crypto.randomBytes(32).toString('hex');
    await TokenModel.create({
      userId: user._id,
      token,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + env.EMAIL_VERIFICATION_EXPIRES_IN * 1000),
    });

    await this.emailService.sendVerificationEmail(user.email, user.name, token);

    logger.info(
      { userId: user._id.toString(), role: ROLES.SCHOOL_ADMIN },
      'School admin registered',
    );
    return user;
  }

  // ── Login ───────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await UserModel.findOne({ email: dto.email }).select('+password');
    if (!user) throw new Error(ERROR_CODES.INVALID_CREDENTIALS);
    if (!user.isActive) throw new Error(ERROR_CODES.ACCOUNT_INACTIVE);
    if (!user.isEmailVerified) throw new Error(ERROR_CODES.EMAIL_NOT_VERIFIED);

    const isMatch = await comparePassword(dto.password, user.password);
    if (!isMatch) throw new Error(ERROR_CODES.INVALID_CREDENTIALS);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user._id);

    await UserModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    logger.info({ userId: user._id.toString() }, 'User logged in');
    return { accessToken, refreshToken, user };
  }

  // ── Token ───────────────────────────────────────────────
  async refreshToken(token: string) {
    const tokenDoc = await TokenModel.findOne({
      token,
      type: 'refresh',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) throw new Error(ERROR_CODES.INVALID_REFRESH_TOKEN);

    const user = await UserModel.findById(tokenDoc.userId);
    if (!user || !user.isActive) throw new Error(ERROR_CODES.INVALID_CREDENTIALS);

    await TokenModel.findByIdAndUpdate(tokenDoc._id, { isUsed: true });

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user._id);

    logger.info({ userId: user._id.toString() }, 'Token refreshed');
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await TokenModel.findOneAndUpdate({ token: refreshToken, type: 'refresh' }, { isUsed: true });
  }

  // ── Email Verification ──────────────────────────────────
  async verifyEmail(token: string): Promise<void> {
    const tokenDoc = await TokenModel.findOne({
      token,
      type: 'email_verification',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) throw new Error(ERROR_CODES.INVALID_VERIFICATION_TOKEN);

    const user = await UserModel.findByIdAndUpdate(
      tokenDoc.userId,
      { isEmailVerified: true },
      { new: true },
    );

    await TokenModel.findByIdAndUpdate(tokenDoc._id, { isUsed: true });

    if (user) {
      await this.emailService.sendWelcomeEmail(user.email, user.name);
    }

    logger.info({ userId: tokenDoc.userId.toString() }, 'Email verified');
  }

  // ── Password ────────────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    const user = await UserModel.findOne({ email });
    if (!user) return; // silent — jangan expose apakah email exist

    // Invalidate token lama jika ada
    await TokenModel.updateMany(
      { userId: user._id, type: 'password_reset', isUsed: false },
      { isUsed: true },
    );

    const token = crypto.randomBytes(32).toString('hex');
    await TokenModel.create({
      userId: user._id,
      token,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_IN * 1000),
    });

    await this.emailService.sendPasswordResetEmail(user.email, user.name, token);
    logger.info({ userId: user._id.toString() }, 'Password reset requested');
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenDoc = await TokenModel.findOne({
      token,
      type: 'password_reset',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) throw new Error(ERROR_CODES.INVALID_RESET_TOKEN);

    const hashed = await hashPassword(newPassword);
    await UserModel.findByIdAndUpdate(tokenDoc.userId, { password: hashed });
    await TokenModel.findByIdAndUpdate(tokenDoc._id, { isUsed: true });

    logger.info({ userId: tokenDoc.userId.toString() }, 'Password reset successful');
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await UserModel.findById(userId).select('+password');
    if (!user) throw new Error(ERROR_CODES.INVALID_CREDENTIALS);

    const isMatch = await comparePassword(dto.currentPassword, user.password);
    if (!isMatch) throw new Error(ERROR_CODES.WRONG_PASSWORD);

    const hashed = await hashPassword(dto.newPassword);
    await UserModel.findByIdAndUpdate(userId, { password: hashed });

    logger.info({ userId }, 'Password changed');
  }

  // ── API Key ─────────────────────────────────────────────
  async createApiKey(userId: string, schoolId: string, dto: CreateApiKeyDto) {
    const rawKey = generateApiKey();
    const hashed = hashApiKey(rawKey);
    const prefix = rawKey.split('_')[1].substring(0, 8);

    await ApiKeyModel.create({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      userId: new mongoose.Types.ObjectId(userId),
      name: dto.name,
      hashedKey: hashed,
      prefix,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    logger.info({ userId, schoolId }, 'API key created');
    return rawKey; // hanya dikembalikan sekali
  }

  async revokeApiKey(apiKeyId: string, schoolId: string): Promise<void> {
    const key = await ApiKeyModel.findOneAndUpdate(
      { _id: apiKeyId, schoolId },
      { isActive: false },
    );
    if (!key) throw new Error(ERROR_CODES.API_KEY_NOT_FOUND);
    logger.info({ apiKeyId, schoolId }, 'API key revoked');
  }

  async listApiKeys(schoolId: string) {
    return ApiKeyModel.find({ schoolId, isActive: true }).select('-hashedKey');
  }

  // ── Private Helpers ─────────────────────────────────────
  private generateAccessToken(user: InstanceType<typeof UserModel>): string {
    return signJwt(
      {
        sub: user._id.toString(),
        role: user.role,
        schoolId: user.schoolId?.toString(),
      },
      env.JWT_SECRET,
      env.JWT_EXPIRES_IN,
    );
  }

  private async generateRefreshToken(userId: mongoose.Types.ObjectId): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    await TokenModel.create({
      userId,
      token,
      type: 'refresh',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return token;
  }
}
