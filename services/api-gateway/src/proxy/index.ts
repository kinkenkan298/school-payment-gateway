import env from '@/config';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

const proxyOptions = (target: string): Options => ({
  target,
  changeOrigin: true,
  on: {
    error: (err, req, res: any) => {
      res.status(502).json({
        success: false,
        message: 'Service temporarily unavailable',
      });
    },
  },
});

export const authProxy = createProxyMiddleware(proxyOptions(env.AUTH_SERVICE_URL));
export const merchantProxy = createProxyMiddleware(proxyOptions(env.MERCHANT_SERVICE_URL));
export const paymentProxy = createProxyMiddleware(proxyOptions(env.PAYMENT_SERVICE_URL));
export const transactionProxy = createProxyMiddleware(proxyOptions(env.TRANSACTION_SERVICE_URL));
export const settlementProxy = createProxyMiddleware(proxyOptions(env.SETTLEMENT_SERVICE_URL));
export const reportingProxy = createProxyMiddleware(proxyOptions(env.REPORTING_SERVICE_URL));
export const webhookProxy = createProxyMiddleware(proxyOptions(env.WEBHOOK_SERVICE_URL));
export const adminProxy = createProxyMiddleware(proxyOptions(env.ADMIN_SERVICE_URL));
