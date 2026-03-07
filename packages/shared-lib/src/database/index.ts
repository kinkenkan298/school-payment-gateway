import mongoose, { MongooseError } from 'mongoose';
import { createLogger } from '../logger';

const logger = createLogger('database');

interface ConnectOptions {
  uri: string;
  dbName: string;
}

export const connectDatabase = async ({ uri, dbName }: ConnectOptions): Promise<void> => {
  try {
    await mongoose.connect(uri, {
      dbName,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${dbName}`);

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected, attempting reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB error:', err);
    });
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      logger.error('MongoDB connection failed:' + error.message);
    } else {
      logger.error('MongoDB connection failed with unknown error:' + error);
    }
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
