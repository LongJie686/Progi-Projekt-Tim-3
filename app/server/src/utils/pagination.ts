import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPaginationParams(query: Record<string, any>): PaginationParams {
  const parsed = paginationSchema.safeParse(query);
  if (!parsed.success) {
    return { page: 1, limit: 10 };
  }
  return { page: parsed.data.page, limit: parsed.data.limit };
}

export function createPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function getSkipTake(page: number, limit: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
