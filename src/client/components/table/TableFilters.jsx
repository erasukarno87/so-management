// TableFilters - Search and filter controls for DataTable
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks';

export function TableFilters({
  searchQuery = '',
  onSearchChange,
  placeholder = 'Search...',
  debounceMs = 300,
  showSearch = true,
  extraFilters,
}) {
  const debouncedSearch = useDebounce(searchQuery, debounceMs);

  const handleSearchChange = (e) => {
    onSearchChange?.(e.target.value);
  };

  const clearSearch = () => {
    onSearchChange?.('');
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      {showSearch && (
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      )}

      {extraFilters}
    </div>
  );
}

// Filter pill component for showing active filters
export function FilterPill({ label, value, onRemove }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 p-0.5 hover:bg-blue-100 rounded"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default TableFilters;