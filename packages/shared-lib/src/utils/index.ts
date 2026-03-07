import { createLogger } from '../logger';
import { ApiResponse, PaginatedResponse, PaginationMeta } from '@school-payment-gateway/types';

const logger = createLogger('utils');

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (message: string, errors?: string[]): ApiResponse => ({
  success: false,
  message,
  errors,
});

export const paginatedResponse = <T>(
  data: T[],
  pagination: PaginationMeta,
): PaginatedResponse<T> => ({
  success: true,
  data,
  pagination,
});

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.warn({ err: error }, 'JSON parse failed, returning fallback');
    return fallback;
  }
};
