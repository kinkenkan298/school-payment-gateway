import { Router, IRouter } from 'express';
import { ReportController } from '@/controllers/report.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { ROLES } from '@school-payment-gateway/shared-lib';

const router: IRouter = Router();
const controller = new ReportController();

const ALL_STAFF = [
  ROLES.SCHOOL_ADMIN,
  ROLES.SCHOOL_STAFF,
  ROLES.PLATFORM_ADMIN,
  ROLES.SUPER_ADMIN,
];
const ADMIN_ROLES = [ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN];

// Dashboard
router.get(
  '/dashboard',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getDashboard.bind(controller),
);

// Ringkasan keuangan gabungan
router.get(
  '/financial',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getFinancialSummary.bind(controller),
);

// Laporan pembayaran
router.get(
  '/payments',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getPaymentReport.bind(controller),
);

// Laporan SPP
router.get(
  '/spp',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getSPPReport.bind(controller),
);

// Laporan transaksi
router.get(
  '/transactions',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getTransactionReport.bind(controller),
);

// Laporan settlement — hanya admin & school admin
router.get(
  '/settlements',
  authenticate,
  authorize(ROLES.SCHOOL_ADMIN, ...ADMIN_ROLES),
  controller.getSettlementReport.bind(controller),
);

// Laporan siswa
router.get(
  '/students',
  authenticate,
  authorize(...ALL_STAFF),
  controller.getStudentReport.bind(controller),
);

// Export CSV
router.get(
  '/export/payments',
  authenticate,
  authorize(ROLES.SCHOOL_ADMIN, ...ADMIN_ROLES),
  controller.exportPaymentsCSV.bind(controller),
);

router.get(
  '/export/bills',
  authenticate,
  authorize(ROLES.SCHOOL_ADMIN, ...ADMIN_ROLES),
  controller.exportBillsCSV.bind(controller),
);

export default router;
