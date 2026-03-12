import { Router } from 'express';
import { SchoolController } from '@/controllers/school.controller';
import { validate } from '@/middlewares/validate.middleware';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { ROLES } from '@school-payment-gateway/shared-lib';
import {
  createSchoolSchema,
  updateSchoolSchema,
  updateBankSchema,
  updateKycSchema,
  updateStatusSchema,
} from '@/validators/school.validator';

const router: Router = Router();
const school = new SchoolController();

router.get('/npsn/:npsn', school.getSchoolByNpsn.bind(school));

router.use(authenticate);

router.get(
  '/me',
  authorize(ROLES.SCHOOL_ADMIN, ROLES.SCHOOL_STAFF),
  school.getMySchool.bind(school),
);
router.patch(
  '/me',
  authorize(ROLES.SCHOOL_ADMIN),
  validate(updateSchoolSchema),
  school.updateMySchool.bind(school),
);
router.patch(
  '/me/bank',
  authorize(ROLES.SCHOOL_ADMIN),
  validate(updateBankSchema),
  school.updateMyBankInfo.bind(school),
);

router.get('/', authorize(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN), school.getSchools.bind(school));
router.post(
  '/',
  authorize(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  validate(createSchoolSchema),
  school.createSchool.bind(school),
);
router.get(
  '/stats',
  authorize(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  school.getSchoolStats.bind(school),
);
router.get(
  '/:id',
  authorize(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  school.getSchoolById.bind(school),
);
router.patch(
  '/:id',
  authorize(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  validate(updateSchoolSchema),
  school.updateSchool.bind(school),
);
router.patch(
  '/:id/kyc',
  authorize(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  validate(updateKycSchema),
  school.updateKycStatus.bind(school),
);
router.patch(
  '/:id/status',
  authorize(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  validate(updateStatusSchema),
  school.updateStatus.bind(school),
);
router.patch(
  '/:id/bank',
  authorize(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  validate(updateBankSchema),
  school.updateBankInfo.bind(school),
);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), school.deleteSchool.bind(school));

export default router;
