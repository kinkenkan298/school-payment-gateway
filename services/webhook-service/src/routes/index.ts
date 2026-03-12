import { Router } from 'express';
import { WebhookController } from '@/controllers/webhook.controller';

const router: Router = Router();
const webhook = new WebhookController();

router.post('/duitku', webhook.duitku.bind(webhook));
router.post('/xendit', webhook.xendit.bind(webhook));
router.post('/midtrans', webhook.midtrans.bind(webhook));

router.get('/logs', webhook.getLogs.bind(webhook));

export default router;
