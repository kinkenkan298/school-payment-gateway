import { Router } from 'express';
import { PaymentController } from '@/controllers/payment.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { ROLES } from '@school-payment-gateway/shared-lib';
import { createPaymentSchema } from '@/validators/payment.validator';

const router: Router = Router();
const payment = new PaymentController();

const allRoles = Object.values(ROLES);

router.post('/webhook/duitku', payment.handleDuitkuWebhook.bind(payment));
router.post('/webhook/xendit', payment.handleXenditWebhook.bind(payment));
router.post('/webhook/midtrans', payment.handleMidtransWebhook.bind(payment));

router.use(authenticate);

router.post('/', validate(createPaymentSchema), payment.createPayment.bind(payment));
router.get('/', authorize(...allRoles), payment.getPayments.bind(payment));
router.get(
  '/stats',
  authorize(ROLES.SCHOOL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  payment.getPaymentStats.bind(payment),
);
router.get('/:id', authorize(...allRoles), payment.getPaymentById.bind(payment));
router.get('/:id/status', authorize(...allRoles), payment.checkStatus.bind(payment));

export default router;
