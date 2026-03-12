import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { ROLES } from '@school-payment-gateway/shared-lib';
import {
  authProxy,
  merchantProxy,
  paymentProxy,
  transactionProxy,
  settlementProxy,
  reportingProxy,
  webhookProxy,
  adminProxy,
} from '../proxy';

const router: Router = Router();

router.use('/api/v1/auth', authProxy);

router.use('/api/v1/merchants', authenticate, merchantProxy);
router.use('/api/v1/payments', authenticate, paymentProxy);
router.use('/api/v1/transactions', authenticate, transactionProxy);
router.use('/api/v1/settlements', authenticate, settlementProxy);
router.use('/api/v1/reports', authenticate, reportingProxy);
router.use('/api/v1/webhooks', authenticate, webhookProxy);

router.use(
  '/api/v1/admin',
  authenticate,
  authorize(ROLES.SCHOOL_ADMIN, ROLES.SUPER_ADMIN),
  adminProxy,
);

export default router;
