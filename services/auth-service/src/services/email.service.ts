import nodemailer from 'nodemailer';
import { createLogger } from '@school-payment-gateway/shared-lib';
import { env } from '@/config';

const logger = createLogger('email-service');

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    this.transporter.verify((error, success) => {
      if (error) {
        logger.error({ err: error }, 'SMTP connection failed');
      } else {
        logger.info('SMTP connection successful');
      }
    });
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const url = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Verifikasi Email - School Payment Gateway',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2>Halo ${name},</h2>
          <p>Terima kasih telah mendaftar. Silakan verifikasi email Anda:</p>
          <a href="${url}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;margin:16px 0">
            Verifikasi Email
          </a>
          <p style="color:#666;font-size:14px">Link berlaku selama 24 jam.</p>
          <p style="color:#666;font-size:14px">Jika Anda tidak mendaftar, abaikan email ini.</p>
        </div>
      `,
    });

    logger.info({ email }, 'Verification email sent');
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const url = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Reset Password - School Payment Gateway',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2>Halo ${name},</h2>
          <p>Anda meminta reset password. Klik link berikut:</p>
          <a href="${url}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;margin:16px 0">
            Reset Password
          </a>
          <p style="color:#666;font-size:14px">Link berlaku selama 1 jam.</p>
          <p style="color:#666;font-size:14px">Jika Anda tidak meminta ini, abaikan email ini.</p>
        </div>
      `,
    });

    logger.info({ email }, 'Password reset email sent');
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Selamat Datang - School Payment Gateway',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2>Selamat datang, ${name}! 🎉</h2>
          <p>Akun Anda telah berhasil diverifikasi.</p>
          <p>Sekarang Anda dapat melakukan pembayaran SPP dengan mudah melalui platform kami.</p>
          <a href="${env.FRONTEND_URL}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;margin:16px 0">
            Mulai Sekarang
          </a>
        </div>
      `,
    });

    logger.info({ email }, 'Welcome email sent');
  }
}
