import mongoose from 'mongoose';
import { createLogger } from '@school-payment-gateway/shared-lib';
import { env } from '@/config';

const logger = createLogger('db-connections');

// Koneksi terpisah per database — reporting baca lintas DB
export const paymentConn = mongoose.createConnection(env.MONGODB_URI, {
  dbName: env.PAYMENT_DB_NAME,
});

export const studentConn = mongoose.createConnection(env.MONGODB_URI, {
  dbName: env.STUDENT_DB_NAME,
});

export const transactionConn = mongoose.createConnection(env.MONGODB_URI, {
  dbName: env.TRANSACTION_DB_NAME,
});

export const settlementConn = mongoose.createConnection(env.MONGODB_URI, {
  dbName: env.SETTLEMENT_DB_NAME,
});

export const schoolConn = mongoose.createConnection(env.MONGODB_URI, {
  dbName: env.SCHOOL_DB_NAME,
});

export const connectAllDatabases = async (): Promise<void> => {
  const conns = [
    { conn: paymentConn, name: env.PAYMENT_DB_NAME },
    { conn: studentConn, name: env.STUDENT_DB_NAME },
    { conn: transactionConn, name: env.TRANSACTION_DB_NAME },
    { conn: settlementConn, name: env.SETTLEMENT_DB_NAME },
    { conn: schoolConn, name: env.SCHOOL_DB_NAME },
  ];

  await Promise.all(
    conns.map(({ conn, name }) =>
      new Promise<void>((resolve, reject) => {
        if (conn.readyState === 1) return resolve();
        conn.once('open', () => {
          logger.info({ db: name }, 'DB connected');
          resolve();
        });
        conn.once('error', reject);
      }),
    ),
  );

  logger.info('All reporting DB connections ready');
};
