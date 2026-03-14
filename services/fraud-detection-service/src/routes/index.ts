import { Router, IRouter } from 'express';
import { FraudController } from '@/controllers/fraud.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { ROLES } from '@school-payment-gateway/shared-lib';
import { updateStatusSchema } from '@/validators/fraud.validator';

const router: IRouter = Router();
const controller = new FraudController();

const ALL_STAFF = [ROLES.SCHOOL_ADMIN, ROLES.SCHOOL_STAFF, ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN];
const ADMIN_ROLES = [ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN];

router.get('/stats', authenticate, authorize(...ALL_STAFF), controller.getStats.bind(controller));

router.get('/', authenticate, authorize(...ALL_STAFF), controller.getAlerts.bind(controller));

router.get('/:id', authenticate, authorize(...ALL_STAFF), controller.getAlertById.bind(controller));

router.patch(
  '/:id/status',
  authenticate,
  authorize(...ADMIN_ROLES),
  validate(updateStatusSchema),
  controller.updateAlertStatus.bind(controller),
);

export default router;
