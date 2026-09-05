import React from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  const setPageSize = (size: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("pageSize", size.toString());
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>
          Showing page <strong>{currentPage}</strong> of{" "}
          <strong>{totalPages}</strong> ({totalItems} total tickets)
        </span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="ml-2 border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => setPage(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => setPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
