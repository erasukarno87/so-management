// TablePagination - Reusable pagination component
import {
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronsLeft, ChevronLeft,
  ChevronRight, ChevronsRight
} from 'lucide-react';
import { useMemo } from 'react';

const PAGE_SIZES = [10, 25, 50, 100];

export function TablePagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  showPageSizeSelector = true,
  searchQuery = '',
  onPageChange,
  onPageSizeChange,
}) {
  const startIndex = (currentPage - 1) * pageSize;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    onPageChange?.(p);
  };

  if (totalPages <= 0) return null;

  return (
    <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {PAGE_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        <span className="text-sm text-slate-600">
          Showing <span className="font-semibold">{startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)}</span> of <span className="font-semibold">{totalItems.toLocaleString()}</span>
          {searchQuery && <span className="text-slate-400"> (filtered)</span>}
        </span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors
                ${page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-200 text-slate-700'}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default TablePagination;