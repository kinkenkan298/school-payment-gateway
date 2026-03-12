import { Router } from 'express';
import { StudentController } from '@/controllers/student.controller';
import { SPPBillController } from '@/controllers/spp-bill.controller';
import { authenticate, authenticateInternal, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { uploadCSV } from '@/middlewares/upload.middleware';
import { ROLES } from '@school-payment-gateway/shared-lib';
import {
  createStudentSchema,
  updateStudentSchema,
  createSPPBillSchema,
  bulkCreateSPPBillSchema,
} from '@/validators/student.validator';

const router: Router = Router();
const student = new StudentController();
const bill = new SPPBillController();

const schoolRoles = [ROLES.SCHOOL_ADMIN, ROLES.SCHOOL_STAFF];
const adminRoles = [ROLES.SCHOOL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN];

router.get('/students/:id', authenticateInternal, student.getStudentById.bind(student));
router.get('/bills/:id', authenticateInternal, bill.getBillById.bind(bill));

router.use(authenticate);

router.get('/students', authorize(...schoolRoles), student.getStudents.bind(student));
router.post(
  '/students',
  authorize(ROLES.SCHOOL_ADMIN),
  validate(createStudentSchema),
  student.createStudent.bind(student),
);
router.post(
  '/students/import',
  authorize(ROLES.SCHOOL_ADMIN),
  uploadCSV,
  student.importStudents.bind(student),
);
router.get('/students/stats', authorize(...schoolRoles), student.getStudentStats.bind(student));
router.get('/students/imports', authorize(...schoolRoles), student.getImportHistory.bind(student));
router.get('/students/nis/:nis', authorize(...schoolRoles), student.getStudentByNis.bind(student));
router.patch(
  '/students/:id',
  authorize(ROLES.SCHOOL_ADMIN),
  validate(updateStudentSchema),
  student.updateStudent.bind(student),
);
router.delete('/students/:id', authorize(ROLES.SCHOOL_ADMIN), student.deleteStudent.bind(student));

router.get('/bills', authorize(...schoolRoles), bill.getBills.bind(bill));
router.post(
  '/bills',
  authorize(ROLES.SCHOOL_ADMIN),
  validate(createSPPBillSchema),
  bill.createBill.bind(bill),
);
router.post(
  '/bills/bulk',
  authorize(ROLES.SCHOOL_ADMIN),
  validate(bulkCreateSPPBillSchema),
  bill.bulkCreateBills.bind(bill),
);
router.get('/bills/stats', authorize(...adminRoles), bill.getBillStats.bind(bill));
router.get(
  '/bills/students/:studentId',
  authorize(...schoolRoles),
  bill.getStudentBills.bind(bill),
);
router.patch('/bills/:id/waive', authorize(ROLES.SCHOOL_ADMIN), bill.waiveBill.bind(bill));
router.post('/bills/mark-overdue', authorize(...adminRoles), bill.markOverdue.bind(bill));

export default router;
