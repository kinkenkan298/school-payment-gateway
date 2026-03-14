import { createLogger, consumeEvent, EXCHANGES, QUEUES } from '@school-payment-gateway/shared-lib';
import { FraudService } from '@/services/fraud.service';

const logger = createLogger('payment-consumer');
const fraudService = new FraudService();

type PaymentSuccessEvent = {
  paymentId: string;
  schoolId: string;
  studentId?: string;
  billId?: string;
  amount: number;
  adminFee?: number;
  totalAmount: number;
  provider: string;
  workflow: string;
  paidAt?: string;
};

export const startPaymentConsumer = async (): Promise<void> => {
  await consumeEvent<PaymentSuccessEvent>(
    EXCHANGES.PAYMENT,
    QUEUES.FRAUD_CHECK,
    'payment.success',
    async (data) => {
      const payload = data.payload;
      logger.info({ paymentId: payload.paymentId }, 'Running fraud check');

      const result = await fraudService.checkPayment(payload);

      logger.info(
        {
          paymentId: result.paymentId,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          approved: result.approved,
        },
        'Fraud check completed',
      );
    },
  );

  logger.info('Fraud check consumer started');
};
