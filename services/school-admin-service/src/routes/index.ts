import { Router, IRouter } from 'express';
import { SchoolAdminController } from '@/controllers/school-admin.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { ROLES } from '@school-payment-gateway/shared-lib';
import {
  approveKycSchema,
  rejectKycSchema,
  updateStatusSchema,
  upsertConfigSchema,
} from '@/validators/school-admin.validator';

const router: IRouter = Router();
const controller = new SchoolAdminController();

const ADMIN_ROLES = [ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN];
const SUPER_ONLY = [ROLES.SUPER_ADMIN];

// Dashboard platform
router.get(
  '/dashboard',
  authenticate,
  authorize(...ADMIN_ROLES),
  controller.getDashboard.bind(controller),
);

// KYC management
router.get(
  '/kyc/pending',
  authenticate,
  authorize(...ADMIN_ROLES),
  controller.getPendingKyc.bind(controller),
);

router.post(
  '/schools/:schoolId/kyc/approve',
  authenticate,
  authorize(...ADMIN_ROLES),
  validate(approveKycSchema),
  controller.approveKyc.bind(controller),
);

router.post(
  '/schools/:schoolId/kyc/reject',
  authenticate,
  authorize(...ADMIN_ROLES),
  validate(rejectKycSchema),
  controller.rejectKyc.bind(controller),
);

// School management
router.get(
  '/schools/:schoolId',
  authenticate,
  authorize(...ADMIN_ROLES),
  controller.getSchoolById.bind(controller),
);

router.patch(
  '/schools/:schoolId/status',
  authenticate,
  authorize(...ADMIN_ROLES),
  validate(updateStatusSchema),
  controller.updateSchoolStatus.bind(controller),
);

// Platform config — hanya super admin
router.get(
  '/configs',
  authenticate,
  authorize(...SUPER_ONLY),
  controller.getConfigs.bind(controller),
);

router.get(
  '/configs/:key',
  authenticate,
  authorize(...SUPER_ONLY),
  controller.getConfigByKey.bind(controller),
);

router.put(
  '/configs',
  authenticate,
  authorize(...SUPER_ONLY),
  validate(upsertConfigSchema),
  controller.upsertConfig.bind(controller),
);

// Audit logs
router.get(
  '/audit-logs',
  authenticate,
  authorize(...ADMIN_ROLES),
  controller.getAuditLogs.bind(controller),
);

export default router;
