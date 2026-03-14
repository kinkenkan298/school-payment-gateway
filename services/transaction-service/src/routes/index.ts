import { Router, IRouter } from 'express';
import { TransactionController } from '@/controllers/transaction.controller';
import { authenticate, authorize, authenticateInternal } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { ROLES } from '@school-payment-gateway/shared-lib';
import {
  createRefundSchema,
  reconcileSchema,
  markSettledSchema,
} from '@/validators/transaction.validator';

const router: IRouter = Router();
const controller = new TransactionController();

const SCHOOL_ROLES = [ROLES.SCHOOL_ADMIN, ROLES.SCHOOL_STAFF];
const ADMIN_ROLES = [ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN];
const ALL_STAFF = [...SCHOOL_ROLES, ...ADMIN_ROLES];

// Internal endpoint — dipanggil settlement-service
router.patch(
  '/settle',
  authenticateInternal,
  validate(markSettledSchema),
  controller.markAsSettled.bind(controller),
);

// Balance — saldo pending settlement milik sekolah
router.get(
  '/balance',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getBalance.bind(controller),
);

// Stats — ringkasan transaksi
router.get(
  '/stats',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getStats.bind(controller),
);

// Reconcile — validasi konsistensi data
router.post(
  '/reconcile',
  authenticate,
  authorize(...ADMIN_ROLES, ROLES.SCHOOL_ADMIN),
  validate(reconcileSchema),
  controller.reconcile.bind(controller),
);

// Refund — hanya platform admin & super admin
router.post(
  '/refund',
  authenticate,
  authorize(...ADMIN_ROLES),
  validate(createRefundSchema),
  controller.createRefund.bind(controller),
);

// List transaksi
router.get(
  '/',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getTransactions.bind(controller),
);

// Detail transaksi
router.get(
  '/:id',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getTransactionById.bind(controller),
);

export default router;
