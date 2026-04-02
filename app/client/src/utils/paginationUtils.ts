export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
}

export const calculatePagination = (params: PaginationParams): PaginationResult => {
  const totalPages = Math.ceil(params.total / params.limit);
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = Math.min(startIndex + params.limit, params.total);

  return {
    currentPage: params.page,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1,
    startIndex,
    endIndex,
  };
};

export const getPageNumbers = (currentPage: number, totalPages: number, maxVisible: number = 5): number[] => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxVisible + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};