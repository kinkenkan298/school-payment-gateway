import { Response } from 'express';
import { StudentService } from '@/services/student.service';
import {
  successResponse,
  paginatedResponse,
  errorResponse,
  HTTP_STATUS,
} from '@school-payment-gateway/shared-lib';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { studentPaginationSchema } from '@/validators/student.validator';
import { StudentModel } from '@/models/student.model';

const studentService = new StudentService();

const ERROR_STATUS: Record<string, number> = {
  STUDENT_NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  NIS_ALREADY_EXISTS: HTTP_STATUS.CONFLICT,
  NISN_ALREADY_EXISTS: HTTP_STATUS.CONFLICT,
};

const handleError = (err: unknown, res: Response): void => {
  const message = err instanceof Error ? err.message : 'Something went wrong';
  const status = ERROR_STATUS[message] ?? HTTP_STATUS.INTERNAL_ERROR;
  res.status(status).json(errorResponse(message));
};

export class StudentController {
  async createStudent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const student = await studentService.createStudent(schoolId, req.body);
      res.status(HTTP_STATUS.CREATED).json(successResponse(student, 'Siswa berhasil ditambahkan'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async importStudents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const userId = req.user!.sub;
      const result = await studentService.importFromCSV(schoolId, userId, req.file!);
      res.status(HTTP_STATUS.CREATED).json(successResponse(result, 'Import siswa selesai'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getStudents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const query = studentPaginationSchema.parse(req.query);
      const result = await studentService.getStudents(schoolId, query);
      res.status(HTTP_STATUS.OK).json(paginatedResponse(result.data, result.pagination));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getStudentById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const isInternal = !req.user;
      const student = isInternal
        ? await StudentModel.findById(req.params.id)
        : await studentService.getStudentById(req.user!.schoolId as string, req.params.id);

      if (!student) {
        res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse('STUDENT_NOT_FOUND'));
        return;
      }

      res.status(HTTP_STATUS.OK).json(successResponse(student));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getStudentByNis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const student = await studentService.getStudentByNis(schoolId, req.params.nis);
      res.status(HTTP_STATUS.OK).json(successResponse(student));
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateStudent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const student = await studentService.updateStudent(schoolId, req.params.id, req.body);
      res.status(HTTP_STATUS.OK).json(successResponse(student, 'Data siswa berhasil diperbarui'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async deleteStudent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      await studentService.deleteStudent(schoolId, req.params.id);
      res.status(HTTP_STATUS.OK).json(successResponse(null, 'Siswa berhasil dinonaktifkan'));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getStudentStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const stats = await studentService.getStudentStats(schoolId);
      res.status(HTTP_STATUS.OK).json(successResponse(stats));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getImportHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = req.user!.schoolId as string;
      const history = await studentService.getImportHistory(schoolId);
      res.status(HTTP_STATUS.OK).json(successResponse(history));
    } catch (err) {
      handleError(err, res);
    }
  }
}
