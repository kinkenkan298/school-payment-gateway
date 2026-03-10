import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { ImportError } from '@school-payment-gateway/types';
import { createLogger } from '@school-payment-gateway/shared-lib';

const logger = createLogger('csv-parser');

export interface ParsedStudent {
  nis: string;
  nisn: string;
  name: string;
  className: string;
  grade: number;
  academicYear: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
}

export interface ParseResult {
  data: ParsedStudent[];
  errors: ImportError[];
  totalRows: number;
}

const REQUIRED_COLUMNS = [
  'nis',
  'nisn',
  'name',
  'className',
  'grade',
  'academicYear',
  'parentName',
  'parentPhone',
];

export const parseStudentCSV = async (buffer: Buffer): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const results: ParsedStudent[] = [];
    const errors: ImportError[] = [];
    let totalRows = 0;

    const stream = Readable.from(buffer);

    stream
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }),
      )
      .on('data', (row: Record<string, string>) => {
        totalRows++;
        const rowErrors: string[] = [];

        // Validasi kolom wajib
        for (const col of REQUIRED_COLUMNS) {
          if (!row[col]) {
            rowErrors.push(`Kolom ${col} wajib diisi`);
          }
        }

        // Validasi NISN 10 digit
        if (row.nisn && row.nisn.length !== 10) {
          rowErrors.push('NISN harus 10 digit');
        }

        // Validasi grade
        const grade = parseInt(row.grade);
        if (isNaN(grade) || grade < 1 || grade > 12) {
          rowErrors.push('Grade harus angka 1-12');
        }

        // Validasi format tahun ajaran
        if (row.academicYear && !/^\d{4}\/\d{4}$/.test(row.academicYear)) {
          rowErrors.push('Format tahun ajaran: 2024/2025');
        }

        if (rowErrors.length > 0) {
          errors.push({ row: totalRows, field: 'multiple', message: rowErrors.join(', ') });
          return;
        }

        results.push({
          nis: row.nis,
          nisn: row.nisn,
          name: row.name,
          className: row.className,
          grade,
          academicYear: row.academicYear,
          parentName: row.parentName,
          parentPhone: row.parentPhone,
          parentEmail: row.parentEmail || undefined,
        });
      })
      .on('error', (err) => {
        logger.error({ err }, 'CSV parse error');
        reject(err);
      })
      .on('end', () => {
        logger.info({ totalRows, success: results.length, failed: errors.length }, 'CSV parsed');
        resolve({ data: results, errors, totalRows });
      });
  });
};
