import { useState, useEffect, useCallback } from 'react';

interface UsePaginationResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => void;
}

interface PaginationParams {
  page: number;
  limit: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function usePagination<T>(
  fetchFunction: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
  limit: number = 10
): UsePaginationResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFunction({ page, limit });
      setData(result.items);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    total,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    goToPage,
    nextPage,
    prevPage,
    refresh: fetchData,
  };
}

export default usePagination;