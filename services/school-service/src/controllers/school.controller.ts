import { Request, Response } from 'express';
import { SchoolService } from '@/services/school.service';
import {
  successResponse,
  paginatedResponse,
  errorResponse,
  HTTP_STATUS,
} from '@school-payment-gateway/shared-lib';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { paginationSchema } from '@/validators/school.validator';

const schoolService = new SchoolService();

const ERROR_STATUS: Record<string, number> = {
  SCHOOL_NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  NPSN_ALREADY_EXISTS: HTTP_STATUS.CONFLICT,
  EMAIL_ALREADY_EXISTS: HTTP_STATUS.CONFLICT,
  SCHOOL_NOT_ACTIVE: HTTP_STATUS.FORBIDDEN,
};

const handleError = (err: unknown, res: Response): void => {
  const message = err instanceof Error ? err.message : 'Something went wrong';
  const status = ERROR_STATUS[message] ?? HTTP_STATUS.INTERNAL_ERROR;
  res.status(status).json(errorResponse(message));
};

export class SchoolController {
  async createSchool(req: AuthRequest, res: Response): Promise<void> {
    try {
      const school = await schoolService.createSchool(req.body);
      res.status(HTTP_STATUS.CREATED).json(successResponse(school, 'Sekolah berhasil didaftarkan'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getSchools(req: Request, res: Response): Promise<void> {
    try {
      const query = paginationSchema.parse(req.query);
      const result = await schoolService.getSchools(query);
      res.status(HTTP_STATUS.OK).json(paginatedResponse(result.data, result.pagination));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getSchoolById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const school = await schoolService.getSchoolById(req.params.id);
      res.status(HTTP_STATUS.OK).json(successResponse(school));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getSchoolByNpsn(req: Request<{ npsn: string }>, res: Response): Promise<void> {
    try {
      const school = await schoolService.getSchoolByNpsn(req.params.npsn);
      res.status(HTTP_STATUS.OK).json(successResponse(school));
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateSchool(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw new Error('SCHOOL_NOT_FOUND');
      }
      const school = await schoolService.updateSchool(req.params.id, req.body);
      res.status(HTTP_STATUS.OK).json(successResponse(school, 'Data sekolah berhasil diperbarui'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateBankInfo(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw new Error('SCHOOL_NOT_FOUND');
      }
      const school = await schoolService.updateBankInfo(req.params.id, req.body);
      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(school, 'Informasi bank berhasil diperbarui'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateKycStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw new Error('SCHOOL_NOT_FOUND');
      }
      const school = await schoolService.updateKycStatus(req.params.id, req.body);
      res.status(HTTP_STATUS.OK).json(successResponse(school, 'Status KYC berhasil diperbarui'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw new Error('SCHOOL_NOT_FOUND');
      }
      const school = await schoolService.updateStatus(req.params.id, req.body);
      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(school, 'Status sekolah berhasil diperbarui'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async deleteSchool(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw new Error('SCHOOL_NOT_FOUND');
      }
      await schoolService.deleteSchool(req.params.id);
      res.status(HTTP_STATUS.OK).json(successResponse(null, 'Sekolah berhasil dinonaktifkan'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getSchoolStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await schoolService.getSchoolStats();
      res.status(HTTP_STATUS.OK).json(successResponse(stats));
    } catch (err) {
      handleError(err, res);
    }
  }

  // Khusus school admin — get own school
  async getMySchool(req: AuthRequest, res: Response): Promise<void> {
    try {
      const school = await schoolService.getSchoolById(req.user!.schoolId as string);
      res.status(HTTP_STATUS.OK).json(successResponse(school));
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateMySchool(req: AuthRequest, res: Response): Promise<void> {
    try {
      const school = await schoolService.updateSchool(req.user!.schoolId as string, req.body);
      res.status(HTTP_STATUS.OK).json(successResponse(school, 'Data sekolah berhasil diperbarui'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateMyBankInfo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const school = await schoolService.updateBankInfo(req.user!.schoolId as string, req.body);
      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(school, 'Informasi bank berhasil diperbarui'));
    } catch (err) {
      handleError(err, res);
    }
  }
}
