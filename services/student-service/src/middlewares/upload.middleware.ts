import multer from 'multer';
import { env } from '@/config';
import { HTTP_STATUS, errorResponse } from '@school-payment-gateway/shared-lib';
import { Request, Response, NextFunction } from 'express';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_IMPORT_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('FILE_NOT_CSV'));
    }
  },
});

export const uploadCSV = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse(`Upload error: ${err.message}`));
      return;
    }
    if (err) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse(err.message));
      return;
    }
    if (!req.file) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('File CSV wajib diupload'));
      return;
    }
    next();
  });
};
