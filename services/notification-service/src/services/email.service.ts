import nodemailer from 'nodemailer';
import { createLogger } from '@school-payment-gateway/shared-lib';
import { env } from '@/config';

const logger = createLogger('email-service');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (params: SendEmailParams): Promise<void> => {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  logger.info({ to: params.to, subject: params.subject }, 'Email sent');
};
