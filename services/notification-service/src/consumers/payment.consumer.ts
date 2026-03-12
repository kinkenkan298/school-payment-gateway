import { createLogger, consumeEvent, EXCHANGES, QUEUES } from '@school-payment-gateway/shared-lib';
import { NotificationService, PaymentSuccessPayload } from '@/services/notification.service';

const logger = createLogger('payment-consumer');
const notificationService = new NotificationService();

export const startPaymentConsumer = async (): Promise<void> => {
  await consumeEvent<PaymentSuccessPayload>(
    EXCHANGES.PAYMENT,
    QUEUES.PAYMENT_SUCCESS_NOTIFICATION,
    'payment.success',
    async (data) => {
      logger.info({ paymentId: data.payload.paymentId }, 'Payment success event received');
      await notificationService.handlePaymentSuccess(data.payload);
    },
  );

  await consumeEvent<PaymentSuccessPayload>(
    EXCHANGES.PAYMENT,
    QUEUES.PAYMENT_FAILED_NOTIFICATION,
    'payment.failed',
    async (data) => {
      logger.info({ paymentId: data.payload.paymentId }, 'Payment failed event received');
      await notificationService.handlePaymentFailed(data.payload);
    },
  );

  logger.info('Payment consumer started');
};
