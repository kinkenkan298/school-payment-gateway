import mongoose, { QueryFilter } from 'mongoose';
import { createLogger, buildPaginationMeta } from '@school-payment-gateway/shared-lib';
import { SchoolModel, ISchool } from '@/models/school.model';
import {
  CreateSchoolDto,
  UpdateSchoolDto,
  UpdateBankDto,
  UpdateKycDto,
  UpdateStatusDto,
  PaginationDto,
} from '@/validators/school.validator';

const logger = createLogger('school-service');

const ERROR_CODES = {
  SCHOOL_NOT_FOUND: 'SCHOOL_NOT_FOUND',
  NPSN_EXISTS: 'NPSN_ALREADY_EXISTS',
  EMAIL_EXISTS: 'EMAIL_ALREADY_EXISTS',
  SCHOOL_NOT_ACTIVE: 'SCHOOL_NOT_ACTIVE',
} as const;

export class SchoolService {
  // ── Create ──────────────────────────────────────────────
  async createSchool(dto: CreateSchoolDto): Promise<ISchool> {
    const existingNpsn = await SchoolModel.findOne({ npsn: dto.npsn });
    if (existingNpsn) throw new Error(ERROR_CODES.NPSN_EXISTS);

    const existingEmail = await SchoolModel.findOne({ email: dto.email });
    if (existingEmail) throw new Error(ERROR_CODES.EMAIL_EXISTS);

    const school = await SchoolModel.create(dto);

    logger.info({ schoolId: school._id.toString(), npsn: dto.npsn }, 'School created');
    return school;
  }

  // ── Read ────────────────────────────────────────────────
  async getSchools(query: PaginationDto) {
    const { page, limit, search, status, level, province } = query;
    const skip = (page - 1) * limit;

    const filter: QueryFilter<ISchool> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { npsn: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (level) filter.level = level;
    if (province) filter.province = { $regex: province, $options: 'i' };

    const [data, total] = await Promise.all([
      SchoolModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      SchoolModel.countDocuments(filter),
    ]);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getSchoolById(id: string): Promise<ISchool> {
    const school = await SchoolModel.findById(id);
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);
    return school;
  }

  async getSchoolByNpsn(npsn: string): Promise<ISchool> {
    const school = await SchoolModel.findOne({ npsn });
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);
    return school;
  }

  // ── Update ──────────────────────────────────────────────
  async updateSchool(id: string, dto: UpdateSchoolDto): Promise<ISchool> {
    const school = await SchoolModel.findByIdAndUpdate(id, dto, { new: true });
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);

    logger.info({ schoolId: id }, 'School updated');
    return school;
  }

  async updateBankInfo(id: string, dto: UpdateBankDto): Promise<ISchool> {
    const school = await SchoolModel.findByIdAndUpdate(id, dto, { new: true });
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);

    logger.info({ schoolId: id }, 'School bank info updated');
    return school;
  }

  async updateKycStatus(id: string, dto: UpdateKycDto): Promise<ISchool> {
    const updateData: Partial<ISchool> = { kycStatus: dto.kycStatus };

    // Auto activate school ketika KYC verified
    if (dto.kycStatus === 'verified') {
      updateData.status = 'active';
    }

    const school = await SchoolModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);

    logger.info({ schoolId: id, kycStatus: dto.kycStatus }, 'School KYC status updated');
    return school;
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<ISchool> {
    const school = await SchoolModel.findByIdAndUpdate(id, { status: dto.status }, { new: true });
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);

    logger.info({ schoolId: id, status: dto.status }, 'School status updated');
    return school;
  }

  // ── Delete ──────────────────────────────────────────────
  async deleteSchool(id: string): Promise<void> {
    const school = await SchoolModel.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (!school) throw new Error(ERROR_CODES.SCHOOL_NOT_FOUND);

    logger.info({ schoolId: id }, 'School deactivated');
  }

  // ── Stats ───────────────────────────────────────────────
  async getSchoolStats() {
    const stats = await SchoolModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const levelStats = await SchoolModel.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
        },
      },
    ]);

    return { byStatus: stats, byLevel: levelStats };
  }
}
