import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validate } from '@/middlewares/validate.middleware';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { ROLES } from '@school-payment-gateway/shared-lib';
import {
  registerParentSchema,
  registerSchoolAdminSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  createApiKeySchema,
} from '@/validators/auth.validator';

const router: Router = Router();
const auth = new AuthController();

router.post('/register/parent', validate(registerParentSchema), auth.registerParent.bind(auth));
router.post(
  '/register/school-admin',
  validate(registerSchoolAdminSchema),
  auth.registerSchoolAdmin.bind(auth),
);
router.post('/login', validate(loginSchema), auth.login.bind(auth));
router.post('/refresh', validate(refreshTokenSchema), auth.refreshToken.bind(auth));
router.post('/logout', auth.logout.bind(auth));
router.get('/verify-email', auth.verifyEmail.bind(auth));
router.post('/forgot-password', validate(forgotPasswordSchema), auth.forgotPassword.bind(auth));
router.post('/reset-password', validate(resetPasswordSchema), auth.resetPassword.bind(auth));

router.use(authenticate);
router.post('/change-password', validate(changePasswordSchema), auth.changePassword.bind(auth));

router.post(
  '/api-keys',
  authorize(ROLES.SCHOOL_ADMIN, ROLES.SUPER_ADMIN),
  validate(createApiKeySchema),
  auth.createApiKey.bind(auth),
);
router.delete(
  '/api-keys/:id',
  authorize(ROLES.SCHOOL_ADMIN, ROLES.SUPER_ADMIN),
  auth.revokeApiKey.bind(auth),
);
router.get(
  '/api-keys',
  authorize(ROLES.SCHOOL_ADMIN, ROLES.SUPER_ADMIN),
  auth.listApiKeys.bind(auth),
);

export default router;
