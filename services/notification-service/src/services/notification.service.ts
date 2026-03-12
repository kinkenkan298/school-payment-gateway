import mongoose from 'mongoose';
import { createLogger } from '@school-payment-gateway/shared-lib';
import { NotificationModel } from '@/models/notification.model';
import { sendEmail } from './email.service';
import { sendPushNotification } from './push.service';
import { paymentSuccessEmail, paymentFailedEmail } from '@/templates/email.templates';

const logger = createLogger('notification-service');

export interface PaymentSuccessPayload {
  paymentId: string;
  schoolId: string;
  studentId: string;
  billId: string;
  amount: number;
  totalAmount: number;
  provider: string;
  paidAt: string;
  // Data tambahan dari student-service (opsional, diisi jika ada)
  studentName?: string;
  parentName?: string;
  parentEmail?: string;
  parentFcmToken?: string;
  month?: number;
  year?: number;
}

export class NotificationService {
  async handlePaymentSuccess(payload: PaymentSuccessPayload): Promise<void> {
    logger.info(
      {
        paymentId: payload.paymentId,
        parentEmail: payload.parentEmail,
        parentFcmToken: payload.parentFcmToken,
        studentName: payload.studentName,
      },
      'Handling payment success notification',
    );
    const {
      paymentId,
      schoolId,
      studentId,
      billId,
      amount,
      paidAt,
      studentName,
      parentName,
      parentEmail,
      parentFcmToken,
      month,
      year,
    } = payload;

    const studentNameResolved = studentName || 'Siswa';
    const parentNameResolved = parentName || 'Orang Tua';
    const monthResolved = month || new Date().getMonth() + 1;
    const yearResolved = year || new Date().getFullYear();

    // Kirim Email
    if (parentEmail) {
      const { subject, html } = paymentSuccessEmail({
        studentName: studentNameResolved,
        parentName: parentNameResolved,
        amount,
        month: monthResolved,
        year: yearResolved,
        paymentId,
        paidAt,
      });

      try {
        await sendEmail({ to: parentEmail, subject, html });

        await NotificationModel.create({
          schoolId: new mongoose.Types.ObjectId(schoolId),
          studentId: new mongoose.Types.ObjectId(studentId),
          paymentId: new mongoose.Types.ObjectId(paymentId),
          billId: new mongoose.Types.ObjectId(billId),
          channel: 'email',
          type: 'payment_success',
          recipient: parentEmail,
          subject,
          body: `Pembayaran SPP ${studentNameResolved} bulan ${monthResolved}/${yearResolved} berhasil`,
          status: 'sent',
          sentAt: new Date(),
        });

        logger.info({ paymentId, parentEmail }, 'Payment success email sent');
      } catch (err) {
        logger.error({ err, paymentId }, 'Failed to send payment success email');

        await NotificationModel.create({
          schoolId: new mongoose.Types.ObjectId(schoolId),
          studentId: new mongoose.Types.ObjectId(studentId),
          paymentId: new mongoose.Types.ObjectId(paymentId),
          billId: new mongoose.Types.ObjectId(billId),
          channel: 'email',
          type: 'payment_success',
          recipient: parentEmail,
          body: `Pembayaran SPP ${studentNameResolved} berhasil`,
          status: 'failed',
          failedReason: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Kirim Push Notification
    if (parentFcmToken) {
      try {
        await sendPushNotification({
          token: parentFcmToken,
          title: '✅ Pembayaran SPP Berhasil',
          body: `Pembayaran SPP ${studentNameResolved} bulan ${monthResolved}/${yearResolved} telah dikonfirmasi`,
          data: { paymentId, type: 'payment_success' },
        });

        await NotificationModel.create({
          schoolId: new mongoose.Types.ObjectId(schoolId),
          studentId: new mongoose.Types.ObjectId(studentId),
          paymentId: new mongoose.Types.ObjectId(paymentId),
          billId: new mongoose.Types.ObjectId(billId),
          channel: 'push',
          type: 'payment_success',
          recipient: parentFcmToken,
          body: `Pembayaran SPP ${studentNameResolved} berhasil`,
          status: 'sent',
          sentAt: new Date(),
        });

        logger.info({ paymentId }, 'Payment success push notification sent');
      } catch (err) {
        logger.error({ err, paymentId }, 'Failed to send push notification');
      }
    }
  }

  async handlePaymentFailed(payload: PaymentSuccessPayload): Promise<void> {
    const {
      paymentId,
      schoolId,
      studentId,
      billId,
      amount,
      studentName,
      parentName,
      parentEmail,
      month,
      year,
    } = payload;

    const studentNameResolved = studentName || 'Siswa';
    const parentNameResolved = parentName || 'Orang Tua';
    const monthResolved = month || new Date().getMonth() + 1;
    const yearResolved = year || new Date().getFullYear();

    if (parentEmail) {
      const { subject, html } = paymentFailedEmail({
        studentName: studentNameResolved,
        parentName: parentNameResolved,
        amount,
        month: monthResolved,
        year: yearResolved,
      });

      try {
        await sendEmail({ to: parentEmail, subject, html });

        await NotificationModel.create({
          schoolId: new mongoose.Types.ObjectId(schoolId),
          studentId: new mongoose.Types.ObjectId(studentId),
          paymentId: new mongoose.Types.ObjectId(paymentId),
          billId: new mongoose.Types.ObjectId(billId),
          channel: 'email',
          type: 'payment_failed',
          recipient: parentEmail,
          subject,
          body: `Pembayaran SPP ${studentNameResolved} gagal`,
          status: 'sent',
          sentAt: new Date(),
        });
      } catch (err) {
        logger.error({ err, paymentId }, 'Failed to send payment failed email');
      }
    }
  }

  async getNotifications(schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { schoolId: new mongoose.Types.ObjectId(schoolId) };

    const [data, total] = await Promise.all([
      NotificationModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      NotificationModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }
}
