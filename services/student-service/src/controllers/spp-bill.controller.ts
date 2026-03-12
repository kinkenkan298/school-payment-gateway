import { Response } from 'express';
import { SPPBillService } from '@/services/spp-bill.service';
import {
  successResponse,
  paginatedResponse,
  errorResponse,
  HTTP_STATUS,
  createLogger,
} from '@school-payment-gateway/shared-lib';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { billPaginationSchema } from '@/validators/student.validator';

const sppBillService = new SPPBillService();
const logger = createLogger('spp-bill-controller');

const ERROR_STATUS: Record<string, number> = {
  BILL_NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  BILL_ALREADY_EXISTS: HTTP_STATUS.CONFLICT,
  STUDENT_NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  BILL_ALREADY_PAID: HTTP_STATUS.CONFLICT,
};

const handleError = (err: unknown, res: Response): void => {
  const message = err instanceof Error ? err.message : 'Something went wrong';
  const status = ERROR_STATUS[message] ?? HTTP_STATUS.INTERNAL_ERROR;
  logger.error(`Error: ${message}, Status: ${status}`);
  res.status(status).json(errorResponse(message));
};

export class SPPBillController {
  async createBill(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const bill = await sppBillService.createBill(schoolId, req.body);
      res.status(HTTP_STATUS.CREATED).json(successResponse(bill, 'Tagihan SPP berhasil dibuat'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async bulkCreateBills(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const result = await sppBillService.bulkCreateBills(schoolId, req.body);
      res
        .status(HTTP_STATUS.CREATED)
        .json(
          successResponse(
            result,
            `${result.created} tagihan berhasil dibuat, ${result.skipped} dilewati`,
          ),
        );
    } catch (err) {
      handleError(err, res);
    }
  }

  async getBills(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const query = billPaginationSchema.parse(req.query);
      const result = await sppBillService.getBills(schoolId, query);
      res.status(HTTP_STATUS.OK).json(paginatedResponse(result.data, result.pagination));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getBillById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const isInternal = !req.user;
      const bill = isInternal
        ? await sppBillService.getBillByInternal(req.params.id)
        : await sppBillService.getBillById(req.user!.schoolId as string, req.params.id);

      res.status(HTTP_STATUS.OK).json(successResponse(bill));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getStudentBills(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const query = billPaginationSchema.parse(req.query);
      const result = await sppBillService.getStudentBills(schoolId, req.params.studentId, query);
      res.status(HTTP_STATUS.OK).json(paginatedResponse(result.data, result.pagination));
    } catch (err) {
      handleError(err, res);
    }
  }

  async waiveBill(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const bill = await sppBillService.waiveBill(schoolId, req.params.id);
      res.status(HTTP_STATUS.OK).json(successResponse(bill, 'Tagihan SPP berhasil dibebaskan'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async markOverdue(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const count = await sppBillService.markAsOverdue(schoolId);
      res
        .status(HTTP_STATUS.OK)
        .json(successResponse({ updated: count }, `${count} tagihan ditandai overdue`));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getBillStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const { academicYear } = req.query as { academicYear?: string };
      const stats = await sppBillService.getBillStats(schoolId, academicYear);
      res.status(HTTP_STATUS.OK).json(successResponse(stats));
    } catch (err) {
      handleError(err, res);
    }
  }
}
