import { Request, Response } from 'express';
import { WebhookService } from '@/services/webhook.service';
import { createLogger } from '@school-payment-gateway/shared-lib';
import { WebhookProvider } from '@/models/webhookLog.model';

const log = createLogger('webhook-controller');
const webhookService = new WebhookService();

const handleWebhook = async (
  provider: WebhookProvider,
  req: Request,
  res: Response,
  signature: string,
): Promise<void> => {
  try {
    await webhookService.processWebhook(
      provider,
      req.body,
      req.headers as Record<string, unknown>,
      signature,
    );

    const responses: Record<WebhookProvider, object> = {
      duitku: { status: '00', message: 'Success' },
      xendit: { status: 'SUCCESS' },
      midtrans: { status: 'OK' },
    };

    res.status(200).json(responses[provider]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed';
    log.error({ provider, err }, 'Webhook processing failed');

    const failResponses: Record<WebhookProvider, object> = {
      duitku: { status: '01', message: 'Failed' },
      xendit: { status: 'FAILED' },
      midtrans: { status: 'FAILED' },
    };

    res.status(200).json(failResponses[provider]);
  }
};

export class WebhookController {
  async duitku(req: Request, res: Response): Promise<void> {
    await handleWebhook('duitku', req, res, '');
  }

  async xendit(req: Request, res: Response): Promise<void> {
    const signature = (req.headers['x-callback-token'] as string) || '';
    await handleWebhook('xendit', req, res, signature);
  }

  async midtrans(req: Request, res: Response): Promise<void> {
    await handleWebhook('midtrans', req, res, '');
  }

  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const provider = req.query.provider as WebhookProvider | undefined;
      const result = await webhookService.getWebhookLogs(page, limit, provider);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Internal error' });
    }
  }
}
