import { Request, Response } from 'express';
import { PaymentService } from '@/services/payment.service';
import {
  successResponse,
  paginatedResponse,
  errorResponse,
  HTTP_STATUS,
  createLogger,
} from '@school-payment-gateway/shared-lib';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { paymentPaginationSchema } from '@/validators/payment.validator';
import { AxiosError } from 'axios';

const paymentService = new PaymentService();
const logger = createLogger('payment-controller');

const ERROR_STATUS: Record<string, number> = {
  PAYMENT_NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  BILL_NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  BILL_ALREADY_PAID: HTTP_STATUS.CONFLICT,
  PAYMENT_ALREADY_PROCESSED: HTTP_STATUS.CONFLICT,
  UNSUPPORTED_PROVIDER: HTTP_STATUS.BAD_REQUEST,
  INVALID_WEBHOOK_SIGNATURE: HTTP_STATUS.UNAUTHORIZED,
};

const handleError = (err: unknown, res: Response): void => {
  let message: string;
  let status: number = HTTP_STATUS.INTERNAL_ERROR;

  if (err instanceof AxiosError) {
    logger.error(`Axios Error: ${err.message}, Response: ${JSON.stringify(err.response?.data)}`);
    message = err.response?.data?.message || 'Ada kesalahan pada layanan service eksternal';
    status = err.response?.status || HTTP_STATUS.INTERNAL_ERROR;
  } else if (err instanceof Error) {
    logger.error(`Error: ${err.message}`);
    message = err.message;
    status = ERROR_STATUS[message] ?? HTTP_STATUS.INTERNAL_ERROR;
  } else {
    logger.error(`Unknown error: ${JSON.stringify(err)}`);
    message = 'Something went wrong';
  }

  message = err instanceof Error ? err.message : 'Something went wrong';
  status = ERROR_STATUS[message] ?? HTTP_STATUS.INTERNAL_ERROR;

  res.status(status).json(errorResponse(message));
};

export class PaymentController {
  async createPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const payment = await paymentService.createPayment(req.body);
      res.status(HTTP_STATUS.CREATED).json(successResponse(payment, 'Pembayaran berhasil dibuat'));
    } catch (err: unknown) {
      handleError(err, res);
    }
  }

  async getPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = paymentPaginationSchema.parse(req.query);
      const result = await paymentService.getPayments(query);
      res.status(HTTP_STATUS.OK).json(paginatedResponse(result.data, result.pagination));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getPaymentById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw new Error('Payment ID not found!');
      }
      const payment = await paymentService.getPaymentById(req.params.id);
      res.status(HTTP_STATUS.OK).json(successResponse(payment));
    } catch (err) {
      handleError(err, res);
    }
  }

  async checkStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw new Error('ID status not found!');
      }
      const payment = await paymentService.checkStatus(req.params.id);
      res.status(HTTP_STATUS.OK).json(successResponse(payment));
    } catch (err) {
      handleError(err, res);
    }
  }

  async getPaymentStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schoolId = (req.query.schoolId as string) || (req.user!.schoolId as string);
      const stats = await paymentService.getPaymentStats(schoolId);
      res.status(HTTP_STATUS.OK).json(successResponse(stats));
    } catch (err) {
      handleError(err, res);
    }
  }

  // Webhook dari provider — tidak butuh auth
  async handleDuitkuWebhook(req: Request, res: Response): Promise<void> {
    try {
      await paymentService.handleWebhook('duitku', req.body, '');
      res.status(HTTP_STATUS.OK).json({ status: '00', message: 'Success' });
    } catch (err) {
      res.status(HTTP_STATUS.OK).json({ status: '01', message: 'Failed' });
    }
  }

  async handleXenditWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-callback-token'] as string;
      await paymentService.handleWebhook('xendit', req.body, signature);
      res.status(HTTP_STATUS.OK).json({ status: 'SUCCESS' });
    } catch (err) {
      res.status(HTTP_STATUS.OK).json({ status: 'FAILED' });
    }
  }

  async handleMidtransWebhook(req: Request, res: Response): Promise<void> {
    try {
      await paymentService.handleWebhook('midtrans', req.body, '');
      res.status(HTTP_STATUS.OK).send('OK');
    } catch (err) {
      res.status(HTTP_STATUS.OK).send('FAILED');
    }
  }
}
