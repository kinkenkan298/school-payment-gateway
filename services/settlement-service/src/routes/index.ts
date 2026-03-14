import { Router, IRouter } from 'express';
import { SettlementController } from '@/controllers/settlement.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { ROLES } from '@school-payment-gateway/shared-lib';
import { createSettlementSchema } from '@/validators/settlement.validator';

const router: IRouter = Router();
const controller = new SettlementController();

const SCHOOL_ROLES = [ROLES.SCHOOL_ADMIN];
const ADMIN_ROLES = [ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN];
const ALL_STAFF = [ROLES.SCHOOL_ADMIN, ROLES.SCHOOL_STAFF, ...ADMIN_ROLES];

// Trigger auto settlement manual — hanya super admin
router.post(
  '/auto',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  controller.runAutoSettlement.bind(controller),
);

// Stats
router.get(
  '/stats',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getStats.bind(controller),
);

// Retry settlement yang gagal
router.post(
  '/:id/retry',
  authenticate,
  authorize(...ADMIN_ROLES),
  controller.retrySettlement.bind(controller),
);

// Cari by batch ID
router.get(
  '/batch/:batchId',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getSettlementByBatchId.bind(controller),
);

// Buat settlement manual
router.post(
  '/',
  authenticate,
  authorize(...SCHOOL_ROLES, ...ADMIN_ROLES),
  validate(createSettlementSchema),
  controller.createSettlement.bind(controller),
);

// List settlements
router.get(
  '/',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getSettlements.bind(controller),
);

// Detail settlement
router.get(
  '/:id',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getSettlementById.bind(controller),
);

export default router;
