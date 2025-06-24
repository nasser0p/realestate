
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = [];
  const maxPagesToShow = 5; // Max number of page buttons to show (excluding prev/next)
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const buttonClass = (isActive: boolean = false, isDisabled: boolean = false) => 
    `px-3 py-2 mx-1 border rounded-md text-sm font-medium transition-colors
    ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
      isActive ? 'bg-royal-blue text-white border-royal-blue' : 
      'bg-white text-gray-700 border-medium-gray hover:bg-light-gray'}`;

  return (
    <nav className="flex justify-center items-center my-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={buttonClass(false, currentPage === 1)}
      >
        Previous
      </button>

      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={buttonClass()}>1</button>
          {startPage > 2 && <span className="px-3 py-2 text-gray-500">...</span>}
        </>
      )}

      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={buttonClass(number === currentPage)}
        >
          {number}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-3 py-2 text-gray-500">...</span>}
          <button onClick={() => onPageChange(totalPages)} className={buttonClass()}>{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={buttonClass(false, currentPage === totalPages)}
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
