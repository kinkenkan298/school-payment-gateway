import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createLogger } from '../logger';

const logger = createLogger('crypto');

export const hashPassword = async (password: string): Promise<string> => {
  return bcryptjs.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

export interface JwtPayload {
  sub: string;
  role: string;
  merchantId?: string;
  [key: string]: unknown;
}

export const signJwt = (payload: JwtPayload, secret: string, expiresIn: string): string => {
  const token = jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  logger.debug({ sub: payload.sub, role: payload.role }, 'JWT signed');
  return token;
};

export const verifyJwt = <T = JwtPayload>(token: string, secret: string): T => {
  try {
    const decoded = jwt.verify(token, secret) as T;
    return decoded;
  } catch (error) {
    logger.warn({ err: error }, 'JWT verification failed');
    throw error;
  }
};

export const generateApiKey = (): string => {
  const prefix = 'pgw';
  const key = crypto.randomBytes(32).toString('hex');
  const apiKey = `${prefix}_${key}`;
  logger.debug('API key generated');
  return apiKey;
};

export const hashApiKey = (apiKey: string): string => {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

const ALGORITHM = 'aes-256-gcm';

export const encrypt = (text: string, secretKey: string): string => {
  try {
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    logger.error({ err: error }, 'Encryption failed');
    throw error;
  }
};

export const decrypt = (encryptedText: string, secretKey: string): string => {
  try {
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
  } catch (error) {
    logger.error({ err: error }, 'Decryption failed');
    throw error;
  }
};
