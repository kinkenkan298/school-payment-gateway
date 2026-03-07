import amqplib, { Channel, ChannelModel, Connection } from 'amqplib';
import { QueueEvent, QueueMessage } from '@school-payment-gateway/types';
import { createLogger } from '../logger';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('queue');

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let queueUrl: string = '';

export const connectQueue = async (url: string): Promise<void> => {
  queueUrl = url;

  try {
    connection = await amqplib.connect(url);
    channel = await connection.createChannel();

    logger.info('RabbitMQ connected');

    connection.on('error', (err) => {
      logger.error({ err }, 'RabbitMQ connection error');
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed, retrying in 5s...');
      connection = null;
      channel = null;
      setTimeout(() => connectQueue(queueUrl), 5000);
    });
  } catch (error) {
    logger.error({ err: error }, 'RabbitMQ connection failed, retrying in 5s...');
    setTimeout(() => connectQueue(queueUrl), 5000);
  }
};

export const publishEvent = async <T>(
  exchange: string,
  event: QueueEvent,
  payload: T,
): Promise<void> => {
  if (!channel) throw new Error('Queue channel not initialized');

  const message: QueueMessage<T> = {
    event,
    payload,
    timestamp: new Date(),
    correlationId: uuidv4(),
  };

  await channel.assertExchange(exchange, 'topic', { durable: true });

  channel.publish(exchange, event, Buffer.from(JSON.stringify(message)), { persistent: true });

  logger.info({ event, correlationId: message.correlationId }, 'Event published');
};

export const consumeEvent = async <T>(
  exchange: string,
  queue: string,
  routingKey: string,
  handler: (message: QueueMessage<T>) => Promise<void>,
): Promise<void> => {
  if (!channel) throw new Error('Queue channel not initialized');

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routingKey);

  channel.prefetch(1);

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const message: QueueMessage<T> = JSON.parse(msg.content.toString());

      logger.info({ event: routingKey, correlationId: message.correlationId }, 'Event received');

      await handler(message);
      channel!.ack(msg);

      logger.info(
        { event: routingKey, correlationId: message.correlationId },
        'Event consumed successfully',
      );
    } catch (error) {
      logger.error({ err: error, event: routingKey }, 'Event handler failed');
      channel!.nack(msg, false, false);
    }
  });

  logger.info({ exchange, queue, routingKey }, 'Consumer registered');
};

export const disconnectQueue = async (): Promise<void> => {
  await channel?.close();
  await connection?.close();
  logger.info('RabbitMQ disconnected gracefully');
};
