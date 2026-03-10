import mongoose, { QueryFilter } from 'mongoose';
import { createLogger, buildPaginationMeta } from '@school-payment-gateway/shared-lib';
import { StudentModel, IStudent } from '@/models/student.model';
import { StudentImportModel } from '@/models/student-import.model';
import { parseStudentCSV } from '@/utils/csv.parser';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentPaginationDto,
} from '@/validators/student.validator';

const logger = createLogger('student-service');

const ERROR_CODES = {
  STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
  NIS_EXISTS: 'NIS_ALREADY_EXISTS',
  NISN_EXISTS: 'NISN_ALREADY_EXISTS',
} as const;

export class StudentService {
  // ── Create ──────────────────────────────────────────────
  async createStudent(schoolId: string, dto: CreateStudentDto): Promise<IStudent> {
    const existingNis = await StudentModel.findOne({ schoolId, nis: dto.nis });
    if (existingNis) throw new Error(ERROR_CODES.NIS_EXISTS);

    const existingNisn = await StudentModel.findOne({ schoolId, nisn: dto.nisn });
    if (existingNisn) throw new Error(ERROR_CODES.NISN_EXISTS);

    const student = await StudentModel.create({
      ...dto,
      schoolId: new mongoose.Types.ObjectId(schoolId),
    });

    logger.info({ studentId: student._id.toString(), schoolId }, 'Student created');
    return student;
  }

  // ── Import CSV ──────────────────────────────────────────
  async importFromCSV(schoolId: string, userId: string, file: Express.Multer.File) {
    const importRecord = await StudentImportModel.create({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      importedBy: new mongoose.Types.ObjectId(userId),
      fileName: file.originalname,
      status: 'processing',
    });

    try {
      const { data, errors, totalRows } = await parseStudentCSV(file.buffer);

      let successRows = 0;
      const importErrors = [...errors];

      for (const [index, row] of data.entries()) {
        try {
          const existing = await StudentModel.findOne({
            schoolId,
            $or: [{ nis: row.nis }, { nisn: row.nisn }],
          });

          if (existing) {
            importErrors.push({
              row: index + 1,
              field: 'nis/nisn',
              message: `NIS ${row.nis} atau NISN ${row.nisn} sudah terdaftar`,
            });
            continue;
          }

          await StudentModel.create({
            ...row,
            schoolId: new mongoose.Types.ObjectId(schoolId),
          });

          successRows++;
        } catch (err) {
          importErrors.push({
            row: index + 1,
            field: 'unknown',
            message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      await StudentImportModel.findByIdAndUpdate(importRecord._id, {
        totalRows,
        successRows,
        failedRows: totalRows - successRows,
        status: importErrors.length === totalRows ? 'failed' : 'success',
        importErrors,
      });

      logger.info(
        { schoolId, totalRows, successRows, failed: importErrors.length },
        'Student import completed',
      );

      return await StudentImportModel.findById(importRecord._id);
    } catch (err) {
      await StudentImportModel.findByIdAndUpdate(importRecord._id, { status: 'failed' });
      throw err;
    }
  }

  // ── Read ────────────────────────────────────────────────
  async getStudents(schoolId: string, query: StudentPaginationDto) {
    const { page, limit, search, grade, className, academicYear, status } = query;
    const skip = (page - 1) * limit;

    const filter: QueryFilter<IStudent> = { schoolId };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nis: { $regex: search, $options: 'i' } },
        { nisn: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
      ];
    }
    if (grade) filter.grade = grade;
    if (className) filter.className = { $regex: className, $options: 'i' };
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      StudentModel.find(filter).skip(skip).limit(limit).sort({ grade: 1, name: 1 }),
      StudentModel.countDocuments(filter),
    ]);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getStudentById(schoolId: string, id: string): Promise<IStudent> {
    const student = await StudentModel.findOne({
      _id: id,
      schoolId,
    });
    if (!student) throw new Error(ERROR_CODES.STUDENT_NOT_FOUND);
    return student;
  }

  async getStudentByNis(schoolId: string, nis: string): Promise<IStudent> {
    const student = await StudentModel.findOne({ schoolId, nis });
    if (!student) throw new Error(ERROR_CODES.STUDENT_NOT_FOUND);
    return student;
  }

  // ── Update ──────────────────────────────────────────────
  async updateStudent(schoolId: string, id: string, dto: UpdateStudentDto): Promise<IStudent> {
    const student = await StudentModel.findOneAndUpdate({ _id: id, schoolId }, dto, { new: true });
    if (!student) throw new Error(ERROR_CODES.STUDENT_NOT_FOUND);

    logger.info({ studentId: id, schoolId }, 'Student updated');
    return student;
  }

  // ── Delete ──────────────────────────────────────────────
  async deleteStudent(schoolId: string, id: string): Promise<void> {
    const student = await StudentModel.findOneAndUpdate(
      { _id: id, schoolId },
      { status: 'inactive' },
    );
    if (!student) throw new Error(ERROR_CODES.STUDENT_NOT_FOUND);

    logger.info({ studentId: id, schoolId }, 'Student deactivated');
  }

  // ── Stats ───────────────────────────────────────────────
  async getStudentStats(schoolId: string) {
    const [byGrade, byStatus, total] = await Promise.all([
      StudentModel.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
        { $group: { _id: '$grade', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      StudentModel.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      StudentModel.countDocuments({ schoolId, status: 'active' }),
    ]);

    return { byGrade, byStatus, totalActive: total };
  }

  // ── Import History ──────────────────────────────────────
  async getImportHistory(schoolId: string) {
    return StudentImportModel.find({ schoolId }).sort({ createdAt: -1 }).limit(20);
  }
}
