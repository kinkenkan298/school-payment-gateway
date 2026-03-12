import { createLogger } from '@school-payment-gateway/shared-lib';
import { env } from '@/config';

const logger = createLogger('push-service');

let firebaseApp: any = null;

const getFirebaseApp = async () => {
  if (firebaseApp) return firebaseApp;

  if (!env.FCM_PROJECT_ID || !env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY) {
    return null;
  }

  const admin = await import('firebase-admin');
  firebaseApp = admin.default.initializeApp({
    credential: admin.default.credential.cert({
      projectId: env.FCM_PROJECT_ID,
      clientEmail: env.FCM_CLIENT_EMAIL,
      privateKey: env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  return firebaseApp;
};

export interface SendPushParams {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const sendPushNotification = async (params: SendPushParams): Promise<void> => {
  const app = await getFirebaseApp();

  if (!app) {
    logger.info(
      { title: params.title, token: params.token.slice(0, 10) + '...' },
      '🔔 [MOCK] Push notification sent',
    );
    return;
  }

  const admin = await import('firebase-admin');
  await admin.default.messaging().send({
    token: params.token,
    notification: {
      title: params.title,
      body: params.body,
    },
    data: params.data,
  });

  logger.info({ title: params.title }, 'Push notification sent');
};
