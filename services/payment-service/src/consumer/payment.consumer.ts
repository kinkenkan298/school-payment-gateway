import { createLogger, consumeEvent, EXCHANGES, QUEUES } from '@school-payment-gateway/shared-lib';
import { PaymentService } from '@/services/payment.service';

const logger = createLogger('webhook-consumer');
const paymentService = new PaymentService();

type WebhookEvent = {
  provider: string;
  externalId: string;
  status: string;
  rawPayload: Record<string, unknown>;
};

export const startWebhookConsumer = async (): Promise<void> => {
  await consumeEvent<WebhookEvent>(
    EXCHANGES.WEBHOOK,
    QUEUES.WEBHOOK_RECEIVED_PAYMENT,
    'webhook.received',
    async (data) => {
      const { provider, externalId, status, rawPayload } = data.payload;

      logger.info({ provider, externalId, status }, 'Webhook event received from queue');

      await paymentService.handleWebhookFromQueue({
        provider,
        externalId,
        status: status as 'success' | 'pending' | 'failed' | 'expired',
        rawPayload,
      });
    },
  );

  logger.info('Webhook consumer started');
};
