import React from 'react';
import { getPageNumbers } from '../../utils/paginationUtils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  showPrevNext = true,
  showFirstLast = false,
}) => {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages, maxVisible);

  const buttonBaseStyles = 'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200';
  const activeStyles = 'bg-primary-500 text-white';
  const inactiveStyles = 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300';
  const disabledStyles = 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200';

  return (
    <nav className="flex items-center justify-center space-x-1" aria-label="Pagination">
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${buttonBaseStyles} ${currentPage === 1 ? disabledStyles : inactiveStyles}`}
          aria-label="First page"
        >
          First
        </button>
      )}
      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${buttonBaseStyles} ${currentPage === 1 ? disabledStyles : inactiveStyles}`}
          aria-label="Previous page"
        >
          Previous
        </button>
      )}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${buttonBaseStyles} ${page === currentPage ? activeStyles : inactiveStyles}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${buttonBaseStyles} ${currentPage === totalPages ? disabledStyles : inactiveStyles}`}
          aria-label="Next page"
        >
          Next
        </button>
      )}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${buttonBaseStyles} ${currentPage === totalPages ? disabledStyles : inactiveStyles}`}
          aria-label="Last page"
        >
          Last
        </button>
      )}
    </nav>
  );
};

export default Pagination;