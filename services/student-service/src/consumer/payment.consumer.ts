import { createLogger, consumeEvent, EXCHANGES, QUEUES } from '@school-payment-gateway/shared-lib';
import { SPPBillModel } from '@/models/spp-bill.model';
import mongoose from 'mongoose';

const logger = createLogger('payment-consumer');

type PaymentSuccessEvent = {
  paymentId: string;
  billId: string;
  studentId: string;
  paidAt: string;
};

export const startPaymentConsumer = async (): Promise<void> => {
  await consumeEvent<PaymentSuccessEvent>(
    EXCHANGES.PAYMENT,
    QUEUES.PAYMENT_SUCCESS,
    'payment.success',
    async (data) => {
      const { paymentId, billId, studentId, paidAt } = data.payload;

      logger.info({ paymentId, billId }, 'Payment success event received');

      const bill = await SPPBillModel.findById(billId);
      if (!bill) {
        logger.warn({ billId }, 'Bill not found for payment success event');
        return;
      }

      if (bill.status === 'paid') {
        logger.info({ billId }, 'Bill already paid, skipping');
        return;
      }

      await SPPBillModel.findByIdAndUpdate(billId, {
        status: 'paid',
        paidAt: new Date(paidAt),
        paymentId: new mongoose.Types.ObjectId(paymentId),
      });

      logger.info({ billId, paymentId }, 'Bill marked as paid');
    },
  );

  logger.info('Payment consumer started');
};
