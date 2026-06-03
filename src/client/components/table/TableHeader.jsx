// TableHeader - Sortable table header component

import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export function TableHeader({ columns = [], sortConfig, onSort }) {
  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig?.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-slate-400" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <thead className="bg-slate-800 text-white">
      <tr>
        {columns.map((col) => (
          <th
            key={col.key}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left
              ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}
              ${col.sortable !== false ? 'cursor-pointer hover:bg-slate-700 select-none' : ''}`}
            style={{ width: col.width }}
            onClick={() => col.sortable !== false && handleSort(col.key)}
          >
            <div className={`flex items-center gap-2 ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
              <span>{col.label}</span>
              {col.sortable !== false && <SortIcon columnKey={col.key} />}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default TableHeader;