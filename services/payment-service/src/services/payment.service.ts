import mongoose from 'mongoose';
import axios from 'axios';
import {
  createLogger,
  buildPaginationMeta,
  publishEvent,
  EXCHANGES,
} from '@school-payment-gateway/shared-lib';
import { PaymentModel, IPayment } from '@/models/payment.model';
import { getProvider } from '@/providers';
import { generateExternalId, calculateAdminFee, calculateExpiredAt } from '@/utils/payment.utils';
import { CreatePaymentDto, PaymentPaginationDto } from '@/validators/payment.validator';
import { env } from '@/config';

const logger = createLogger('payment-service');

const ERROR_CODES = {
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  BILL_NOT_FOUND: 'BILL_NOT_FOUND',
  BILL_ALREADY_PAID: 'BILL_ALREADY_PAID',
  PAYMENT_ALREADY_PROCESSED: 'PAYMENT_ALREADY_PROCESSED',
  UNSUPPORTED_PROVIDER: 'UNSUPPORTED_PROVIDER',
} as const;

export class PaymentService {
  async createPayment(dto: CreatePaymentDto): Promise<IPayment> {
    const bill = await this.getBillFromStudentService(dto.billId, dto.schoolId);
    if (!bill) throw new Error(ERROR_CODES.BILL_NOT_FOUND);
    if (bill.status === 'paid') throw new Error(ERROR_CODES.BILL_ALREADY_PAID);

    logger.info(
      {
        dtoBillId: dto.billId,
        billIdFromService: bill._id,
        match: dto.billId === bill._id.toString(),
      },
      'Bill ID check',
    );

    const adminFee = calculateAdminFee(bill.amount);
    const totalAmount = bill.amount + adminFee;
    const expiredAt = calculateExpiredAt();
    const externalId = generateExternalId(dto.schoolId);

    const provider = getProvider(dto.provider);
    const providerResult = await provider.createPayment({
      externalId,
      amount: totalAmount,
      method: dto.method,
      description: `Pembayaran SPP - ${bill.studentName} - ${bill.month}/${bill.year}`,
      payerName: dto.payerName,
      payerEmail: dto.payerEmail,
      payerPhone: dto.payerPhone,
      expiredAt,
    });

    const payment = await PaymentModel.create({
      schoolId: new mongoose.Types.ObjectId(dto.schoolId),
      studentId: new mongoose.Types.ObjectId(dto.studentId),
      billId: new mongoose.Types.ObjectId(dto.billId),
      externalId,
      amount: bill.amount,
      adminFee,
      totalAmount,
      currency: 'IDR',
      status: 'pending',
      method: dto.method,
      provider: dto.provider,
      workflow: 'provider_to_platform',
      description: `SPP ${bill.month}/${bill.year}`,
      payerName: dto.payerName,
      payerEmail: dto.payerEmail,
      payerPhone: dto.payerPhone,
      paymentUrl: providerResult.paymentUrl,
      providerTransactionId: providerResult.providerTransactionId,
      providerResponse: providerResult.providerResponse,
      expiredAt,
    });

    logger.info(
      { paymentId: payment._id.toString(), externalId, provider: dto.provider },
      'Payment created',
    );

    return payment;
  }

  async handleWebhook(
    provider: string,
    payload: Record<string, unknown>,
    signature: string,
  ): Promise<void> {
    const providerInstance = getProvider(provider as any);

    const isValid = providerInstance.verifyWebhook(payload, signature);
    if (!isValid) {
      logger.warn({ provider }, 'Invalid webhook signature');
      throw new Error('INVALID_WEBHOOK_SIGNATURE');
    }

    const externalId = (payload.merchantOrderId ||
      payload.external_id ||
      payload.order_id) as string;
    const status = providerInstance.normalizeWebhookStatus(payload);

    const payment = await PaymentModel.findOne({ externalId });
    if (!payment) {
      logger.warn({ externalId }, 'Payment not found for webhook');
      return;
    }

    if (payment.status === 'success' || payment.status === 'failed') {
      logger.info({ externalId }, 'Payment already processed, skipping webhook');
      return;
    }

    const newStatus =
      status === 'success'
        ? 'success'
        : status === 'expired'
          ? 'expired'
          : status === 'failed'
            ? 'failed'
            : payment.status;

    await PaymentModel.findByIdAndUpdate(payment._id, {
      status: newStatus,
      providerResponse: payload,
      ...(status === 'success' && { paidAt: new Date() }),
    });

    if (status === 'success') {
      const student = await this.getStudentFromStudentService(payment.studentId.toString());

      await publishEvent(EXCHANGES.PAYMENT, 'payment.success', {
        paymentId: payment._id.toString(),
        schoolId: payment.schoolId.toString(),
        studentId: payment.studentId.toString(),
        billId: payment.billId.toString(),
        amount: payment.amount,
        totalAmount: payment.totalAmount,
        provider,
        paidAt: new Date(),

        studentName: student?.name || null,
        parentName: student?.parentName || null,
        parentEmail: student?.parentEmail || null,
        parentPhone: student?.parentPhone || null,
        parentFcmToken: student?.fcmToken || null,
        month: payment.description.split(' ')[1]?.split('/')[0],
        year: payment.description.split(' ')[1]?.split('/')[1],
      });

      logger.info(
        { paymentId: payment._id.toString(), externalId },
        'Payment success event published',
      );
    } else if (status === 'failed' || status === 'expired') {
      await publishEvent(EXCHANGES.PAYMENT, 'payment.failed', {
        paymentId: payment._id.toString(),
        schoolId: payment.schoolId.toString(),
        studentId: payment.studentId.toString(),
        billId: payment.billId.toString(),
        status: newStatus,
      });
    }
  }

  async checkStatus(id: string): Promise<IPayment> {
    const payment = await PaymentModel.findById(id);
    if (!payment) throw new Error(ERROR_CODES.PAYMENT_NOT_FOUND);

    if (payment.status === 'pending' || payment.status === 'processing') {
      const provider = getProvider(payment.provider);
      const result = await provider.checkStatus(payment.externalId);

      if (result.status !== 'pending') {
        await PaymentModel.findByIdAndUpdate(payment._id, {
          status:
            result.status === 'success'
              ? 'success'
              : result.status === 'expired'
                ? 'expired'
                : 'failed',
          providerResponse: result.providerResponse,
          ...(result.status === 'success' && { paidAt: new Date() }),
        });

        if (result.status === 'success') {
          const student = await this.getStudentFromStudentService(payment.studentId.toString());

          await publishEvent(EXCHANGES.PAYMENT, 'payment.success', {
            paymentId: payment._id.toString(),
            schoolId: payment.schoolId.toString(),
            studentId: payment.studentId.toString(),
            billId: payment.billId.toString(),
            amount: payment.amount,
            totalAmount: payment.totalAmount,
            provider: payment.provider,
            paidAt: new Date(),

            studentName: student?.name || null,
            parentName: student?.parentName || null,
            parentEmail: student?.parentEmail || null,
            parentPhone: student?.parentPhone || null,
            parentFcmToken: student?.fcmToken || null,

            month: payment.description.split(' ')[1]?.split('/')[0],
            year: payment.description.split(' ')[1]?.split('/')[1],
          });

          logger.info(
            { paymentId: payment._id.toString() },
            'Payment success event published from checkStatus',
          );
        } else if (result.status === 'failed' || result.status === 'expired') {
          await publishEvent(EXCHANGES.PAYMENT, 'payment.failed', {
            paymentId: payment._id.toString(),
            schoolId: payment.schoolId.toString(),
            studentId: payment.studentId.toString(),
            billId: payment.billId.toString(),
            status: result.status,
          });
        }
      }
    }

    return (await PaymentModel.findById(id))!;
  }

  async getPayments(query: PaymentPaginationDto) {
    const { page, limit, schoolId, studentId, billId, status, provider, startDate, endDate } =
      query;
    const skip = (page - 1) * limit;

    const filter: mongoose.QueryFilter<IPayment> = {};
    if (schoolId) filter.schoolId = new mongoose.Types.ObjectId(schoolId);
    if (studentId) filter.studentId = new mongoose.Types.ObjectId(studentId);
    if (billId) filter.billId = new mongoose.Types.ObjectId(billId);
    if (status) filter.status = status;
    if (provider) filter.provider = provider;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      PaymentModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      PaymentModel.countDocuments(filter),
    ]);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getPaymentById(id: string): Promise<IPayment> {
    const payment = await PaymentModel.findById(id);
    if (!payment) throw new Error(ERROR_CODES.PAYMENT_NOT_FOUND);
    return payment;
  }

  async getPaymentStats(schoolId: string) {
    const [byStatus, byProvider, totalRevenue] = await Promise.all([
      PaymentModel.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      PaymentModel.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), status: 'success' } },
        { $group: { _id: '$provider', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      PaymentModel.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' }, fees: { $sum: '$adminFee' } } },
      ]),
    ]);

    return {
      byStatus,
      byProvider,
      totalRevenue: totalRevenue[0]?.total ?? 0,
      totalFees: totalRevenue[0]?.fees ?? 0,
    };
  }

  private async getBillFromStudentService(billId: string, schoolId: string) {
    try {
      logger.info('Fetching bill from student service');
      const response = await axios.get(`${env.STUDENT_SERVICE_URL}/bills/${billId}`, {
        headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET },
      });

      logger.info('Bill fetched successfully from student service');
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Error fetching bill from student service: ${error.message}, Response: ${JSON.stringify(
            error.response?.data,
          )}`,
        );
      }
      return null;
    }
  }

  private async getStudentFromStudentService(studentId: string) {
    try {
      const response = await axios.get(`${env.STUDENT_SERVICE_URL}/students/${studentId}`, {
        headers: { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET },
      });
      return response.data.data;
    } catch {
      return null;
    }
  }

  async handleWebhookFromQueue(data: {
    provider: string;
    externalId: string;
    status: 'success' | 'pending' | 'failed' | 'expired';
    rawPayload: Record<string, unknown>;
  }): Promise<void> {
    const { provider, externalId, status, rawPayload } = data;

    const payment = await PaymentModel.findOne({ externalId });
    if (!payment) {
      logger.warn({ externalId }, 'Payment not found for webhook event');
      return;
    }

    if (payment.status === 'success' || payment.status === 'failed') {
      logger.info({ externalId }, 'Payment already processed, skipping');
      return;
    }

    const newStatus =
      status === 'success'
        ? 'success'
        : status === 'expired'
          ? 'expired'
          : status === 'failed'
            ? 'failed'
            : payment.status;

    await PaymentModel.findByIdAndUpdate(payment._id, {
      status: newStatus,
      providerResponse: rawPayload,
      ...(status === 'success' && { paidAt: new Date() }),
    });

    if (status === 'success') {
      const student = await this.getStudentFromStudentService(payment.studentId.toString());

      await publishEvent(EXCHANGES.PAYMENT, 'payment.success', {
        paymentId: payment._id.toString(),
        schoolId: payment.schoolId.toString(),
        studentId: payment.studentId.toString(),
        billId: payment.billId.toString(),
        amount: payment.amount,
        totalAmount: payment.totalAmount,
        provider,
        paidAt: new Date(),
        studentName: student?.name || null,
        parentName: student?.parentName || null,
        parentEmail: student?.parentEmail || null,
        parentPhone: student?.parentPhone || null,
        parentFcmToken: student?.fcmToken || null,
        month: payment.description.split(' ')[1]?.split('/')[0],
        year: payment.description.split(' ')[1]?.split('/')[1],
      });

      logger.info(
        { paymentId: payment._id.toString(), externalId },
        'Payment success from webhook queue',
      );
    } else if (status === 'failed' || status === 'expired') {
      await publishEvent(EXCHANGES.PAYMENT, 'payment.failed', {
        paymentId: payment._id.toString(),
        schoolId: payment.schoolId.toString(),
        studentId: payment.studentId.toString(),
        billId: payment.billId.toString(),
        status: newStatus,
      });
    }
  }
}
