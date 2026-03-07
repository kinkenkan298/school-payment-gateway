import pino, { Logger, LoggerOptions } from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

const baseOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
};

const devTransport: LoggerOptions['transport'] = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
    ignore: 'pid,hostname',
    messageFormat: '[{service}] {msg}',
  },
};

export const createLogger = (serviceName: string): Logger => {
  return pino({
    ...baseOptions,
    transport: isDevelopment ? devTransport : undefined,
    base: {
      service: serviceName,
      env: process.env.NODE_ENV || 'development',
    },
  });
};

export type { Logger };
