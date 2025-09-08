"use client";

import React from "react";

type PaginationProps = {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: PaginationProps) {
  const pageNumbers = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      {/* Botão anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`pagination-button ${currentPage === 1 ? "disabled" : ""}`}
      >
        &laquo;
      </button>

      {/* Números de página */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-button ${
            currentPage === page ? "active" : ""
          }`}
        >
          {page}
        </button>
      ))}

      {/* Botão próximo */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className={`pagination-button ${
          currentPage === lastPage ? "disabled" : ""
        }`}
      >
        &raquo;
      </button>
    </nav>
  );
}
