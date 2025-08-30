interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  lastPage,
  onPageChange,
}: PaginationProps) => {
  return (
    <>
      {/* Paginação simples */}
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span style={{ margin: "0 10px" }}>
          Página {currentPage} de {lastPage}
        </span>
        <button
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          disabled={currentPage === lastPage}
        >
          Próxima
        </button>
      </div>
    </>
  );
};

export default Pagination;
