import { createLogger, publishEvent, EXCHANGES } from '@school-payment-gateway/shared-lib';
import { WebhookLogModel, WebhookProvider } from '@/models/webhook-log.model';
import {
  verifyDuitku,
  extractDuitkuExternalId,
  normalizeDuitkuStatus,
} from '@/verifiers/duitku.verifier';
import {
  verifyXendit,
  extractXenditExternalId,
  normalizeXenditStatus,
} from '@/verifiers/xendit.verifier';
import {
  verifyMidtrans,
  extractMidtransExternalId,
  normalizeMidtransStatus,
} from '@/verifiers/midtrans.verifier';
import { createLogger as logger } from '@school-payment-gateway/shared-lib';

const log = createLogger('webhook-service');

type VerifyFn = (payload: Record<string, unknown>, signature: string) => boolean;
type ExtractFn = (payload: Record<string, unknown>) => string;
type NormalizeFn = (
  payload: Record<string, unknown>,
) => 'success' | 'pending' | 'failed' | 'expired';

const providerConfig: Record<
  WebhookProvider,
  {
    verify: VerifyFn;
    extractExternalId: ExtractFn;
    normalizeStatus: NormalizeFn;
  }
> = {
  duitku: {
    verify: (payload) => verifyDuitku(payload),
    extractExternalId: extractDuitkuExternalId,
    normalizeStatus: normalizeDuitkuStatus,
  },
  xendit: {
    verify: (payload, signature) => verifyXendit(payload, signature),
    extractExternalId: extractXenditExternalId,
    normalizeStatus: normalizeXenditStatus,
  },
  midtrans: {
    verify: (payload) => verifyMidtrans(payload),
    extractExternalId: extractMidtransExternalId,
    normalizeStatus: normalizeMidtransStatus,
  },
};

export class WebhookService {
  async processWebhook(
    provider: WebhookProvider,
    payload: Record<string, unknown>,
    headers: Record<string, unknown>,
    signature: string,
  ): Promise<void> {
    const config = providerConfig[provider];

    const isValid = config.verify(payload, signature);
    if (!isValid) {
      log.warn({ provider }, 'Invalid webhook signature');
      throw new Error('INVALID_SIGNATURE');
    }

    const externalId = config.extractExternalId(payload);
    if (!externalId) {
      throw new Error('MISSING_EXTERNAL_ID');
    }

    const existing = await WebhookLogModel.findOne({
      provider,
      externalId,
      status: 'processed',
    });

    if (existing) {
      log.info({ provider, externalId }, 'Duplicate webhook received, skipping');
      await WebhookLogModel.create({
        provider,
        externalId,
        rawPayload: payload,
        headers,
        status: 'duplicate',
      });
      return;
    }

    const webhookLog = await WebhookLogModel.create({
      provider,
      externalId,
      rawPayload: payload,
      headers,
      status: 'received',
    });

    const status = config.normalizeStatus(payload);

    try {
      await publishEvent(EXCHANGES.WEBHOOK, 'webhook.received', {
        webhookLogId: webhookLog._id.toString(),
        provider,
        externalId,
        status,
        rawPayload: payload,
      });

      await WebhookLogModel.findByIdAndUpdate(webhookLog._id, {
        status: 'processed',
        processedAt: new Date(),
      });

      log.info({ provider, externalId, status }, 'Webhook processed and published');
    } catch (err) {
      await WebhookLogModel.findByIdAndUpdate(webhookLog._id, {
        status: 'failed',
        failedReason: err instanceof Error ? err.message : 'Unknown error',
      });
      throw err;
    }
  }

  async getWebhookLogs(page = 1, limit = 10, provider?: WebhookProvider) {
    const skip = (page - 1) * limit;
    const filter = provider ? { provider } : {};

    const [data, total] = await Promise.all([
      WebhookLogModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      WebhookLogModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }
}
