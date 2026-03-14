import { createLogger, consumeEvent, EXCHANGES, QUEUES } from '@school-payment-gateway/shared-lib';
import { TransactionService } from '@/services/transaction.service';

const logger = createLogger('payment-consumer');
const transactionService = new TransactionService();

type PaymentSuccessEvent = {
  paymentId: string;
  schoolId: string;
  studentId: string;
  billId: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  provider: string;
  workflow: string;
  description?: string;
};

export const startPaymentConsumer = async (): Promise<void> => {
  await consumeEvent<PaymentSuccessEvent>(
    EXCHANGES.PAYMENT,
    QUEUES.TRANSACTION_PAYMENT,
    'payment.success',
    async (data) => {
      const { paymentId, schoolId, studentId, billId, amount, adminFee, totalAmount, provider, workflow, description } =
        data.payload;

      logger.info({ paymentId, schoolId }, 'Payment success event received, creating transactions');

      await transactionService.createFromPayment({
        paymentId,
        schoolId,
        studentId,
        billId,
        amount,
        adminFee,
        totalAmount,
        provider,
        workflow,
        description,
      });
    },
  );

  logger.info('Payment consumer started');
};
