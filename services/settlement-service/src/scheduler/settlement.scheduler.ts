import { createLogger } from '@school-payment-gateway/shared-lib';
import { SettlementService } from '@/services/settlement.service';
import { env } from '@/config';

const logger = createLogger('settlement-scheduler');
const settlementService = new SettlementService();

let schedulerTimer: NodeJS.Timeout | null = null;

const getNextRunMs = (): number => {
  const now = new Date();
  const next = new Date();
  next.setHours(env.SETTLEMENT_SCHEDULE_HOUR, 0, 0, 0);

  // Jika jam target sudah lewat hari ini, jadwalkan besok
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
};

const runScheduledSettlement = async (): Promise<void> => {
  logger.info('Scheduled settlement triggered');
  try {
    const result = await settlementService.runAutomaticSettlement();
    logger.info(result, 'Scheduled settlement completed');
  } catch (err) {
    logger.error({ err }, 'Scheduled settlement failed');
  }

  // Jadwalkan run berikutnya (24 jam kemudian)
  schedulerTimer = setTimeout(runScheduledSettlement, 24 * 60 * 60 * 1000);
};

export const startSettlementScheduler = (): void => {
  const msUntilFirstRun = getNextRunMs();
  const hoursUntil = Math.floor(msUntilFirstRun / 1000 / 60 / 60);
  const minutesUntil = Math.floor((msUntilFirstRun / 1000 / 60) % 60);

  logger.info(
    { scheduledHour: env.SETTLEMENT_SCHEDULE_HOUR, in: `${hoursUntil}h ${minutesUntil}m` },
    'Settlement scheduler started',
  );

  schedulerTimer = setTimeout(runScheduledSettlement, msUntilFirstRun);
};

export const stopSettlementScheduler = (): void => {
  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
    logger.info('Settlement scheduler stopped');
  }
};
