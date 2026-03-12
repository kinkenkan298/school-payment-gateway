import mongoose, { QueryFilter } from 'mongoose';
import { createLogger, buildPaginationMeta } from '@school-payment-gateway/shared-lib';
import { SPPBillModel, ISPPBill } from '@/models/spp-bill.model';
import { StudentModel } from '@/models/student.model';
import {
  CreateSPPBillDto,
  BulkCreateSPPBillDto,
  BillPaginationDto,
} from '@/validators/student.validator';

const logger = createLogger('spp-bill-service');

const ERROR_CODES = {
  BILL_NOT_FOUND: 'BILL_NOT_FOUND',
  BILL_EXISTS: 'BILL_ALREADY_EXISTS',
  STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
  BILL_ALREADY_PAID: 'BILL_ALREADY_PAID',
} as const;

export class SPPBillService {
  async createBill(schoolId: string, dto: CreateSPPBillDto): Promise<ISPPBill> {
    const student = await StudentModel.findOne({ _id: dto.studentId, schoolId });
    if (!student) throw new Error(ERROR_CODES.STUDENT_NOT_FOUND);

    const existing = await SPPBillModel.findOne({
      studentId: dto.studentId,
      month: dto.month,
      year: dto.year,
    });
    if (existing) throw new Error(ERROR_CODES.BILL_EXISTS);

    const bill = await SPPBillModel.create({
      ...dto,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      studentId: new mongoose.Types.ObjectId(dto.studentId),
      dueDate: new Date(dto.dueDate),
    });

    logger.info({ billId: bill._id.toString(), schoolId }, 'SPP bill created');
    return bill;
  }

  async bulkCreateBills(schoolId: string, dto: BulkCreateSPPBillDto) {
    const students = await StudentModel.find({
      schoolId,
      status: 'active',
      ...(dto.gradeFilter ? { grade: dto.gradeFilter } : {}),
    });
    if (students.length === 0) throw new Error(ERROR_CODES.STUDENT_NOT_FOUND);

    let created = 0;
    let skipped = 0;

    for (const student of students) {
      const existing = await SPPBillModel.findOne({
        studentId: student._id,
        month: dto.month,
        year: dto.year,
      });

      if (existing) {
        skipped++;
        continue;
      }

      await SPPBillModel.create({
        schoolId: new mongoose.Types.ObjectId(schoolId),
        studentId: student._id,
        academicYear: dto.academicYear,
        month: dto.month,
        year: dto.year,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
      });

      created++;
    }

    logger.info({ schoolId, created, skipped }, 'Bulk SPP bills created');
    return { created, skipped, total: students.length };
  }

  async getBills(schoolId: string, query: BillPaginationDto) {
    const { page, limit, studentId, academicYear, month, year, status } = query;
    const skip = (page - 1) * limit;

    const filter: QueryFilter<ISPPBill> = { schoolId };
    if (studentId) filter.studentId = new mongoose.Types.ObjectId(studentId);
    if (academicYear) filter.academicYear = academicYear;
    if (month) filter.month = month;
    if (year) filter.year = year;
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      SPPBillModel.find(filter)
        .populate('studentId', 'name nis nisn className grade')
        .skip(skip)
        .limit(limit)
        .sort({ year: -1, month: -1 }),
      SPPBillModel.countDocuments(filter),
    ]);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getBillById(schoolId: string, id: string): Promise<ISPPBill> {
    const bill = await SPPBillModel.findOne({ _id: id, schoolId }).populate(
      'studentId',
      'name nis nisn className grade',
    );
    if (!bill) throw new Error(ERROR_CODES.BILL_NOT_FOUND);
    return bill;
  }

  async getBillByInternal(id: string): Promise<ISPPBill> {
    const bill = await SPPBillModel.findById(id).populate(
      'studentId',
      'name nis nisn className grade',
    );
    if (!bill) throw new Error(ERROR_CODES.BILL_NOT_FOUND);
    return bill;
  }

  async getStudentBills(schoolId: string, studentId: string, query: BillPaginationDto) {
    return this.getBills(schoolId, { ...query, studentId });
  }

  async markAsPaid(schoolId: string, id: string, paymentId: string): Promise<ISPPBill> {
    const bill = await SPPBillModel.findOne({ _id: id, schoolId });
    if (!bill) throw new Error(ERROR_CODES.BILL_NOT_FOUND);
    if (bill.status === 'paid') throw new Error(ERROR_CODES.BILL_ALREADY_PAID);

    const updated = await SPPBillModel.findByIdAndUpdate(
      id,
      {
        status: 'paid',
        paidAt: new Date(),
        paymentId: new mongoose.Types.ObjectId(paymentId),
      },
      { new: true },
    );

    logger.info({ billId: id, paymentId, schoolId }, 'SPP bill marked as paid');
    return updated!;
  }

  async markAsOverdue(schoolId: string): Promise<number> {
    const result = await SPPBillModel.updateMany(
      {
        schoolId,
        status: 'unpaid',
        dueDate: { $lt: new Date() },
      },
      { status: 'overdue' },
    );

    logger.info({ schoolId, updated: result.modifiedCount }, 'Bills marked as overdue');
    return result.modifiedCount;
  }

  async waiveBill(schoolId: string, id: string): Promise<ISPPBill> {
    const bill = await SPPBillModel.findOneAndUpdate(
      { _id: id, schoolId, status: { $ne: 'paid' } },
      { status: 'waived' },
      { new: true },
    );
    if (!bill) throw new Error(ERROR_CODES.BILL_NOT_FOUND);

    logger.info({ billId: id, schoolId }, 'SPP bill waived');
    return bill;
  }

  async getBillStats(schoolId: string, academicYear?: string) {
    const match: QueryFilter<ISPPBill> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
    };
    if (academicYear) match.academicYear = academicYear;

    const [byStatus, totalAmount] = await Promise.all([
      SPPBillModel.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      SPPBillModel.aggregate([
        { $match: { ...match, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      byStatus,
      totalPaidAmount: totalAmount[0]?.total ?? 0,
    };
  }
}
