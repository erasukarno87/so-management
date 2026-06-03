// TableRow - Table body row component
import { Search } from 'lucide-react';

const ROW_HEIGHT = 'h-12';

export function TableRow({
  row,
  columns,
  rowIndex,
  striped = true,
  hoverable = true,
  onClick,
}) {
  return (
    <tr
      className={`${ROW_HEIGHT} transition-colors
        ${striped && rowIndex % 2 === 1 ? 'bg-slate-100' : 'bg-white'}
        ${hoverable ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
      onClick={() => onClick?.(row)}
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className={`px-4 py-3 text-sm
            ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}
            ${col.className || ''}`}
        >
          {col.render ? col.render(row[col.key], row) : row[col.key]}
        </td>
      ))}
    </tr>
  );
}

export function TableBody({ columns, data, loading, emptyMessage, searchQuery, striped, hoverable, onRowClick }) {
  if (loading) {
    return (
      <tbody className="divide-y divide-slate-100">
        <tr>
          <td colSpan={columns.length} className="px-4 py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 text-sm">Loading data...</span>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (data.length === 0) {
    return (
      <tbody className="divide-y divide-slate-100">
        <tr>
          <td colSpan={columns.length} className="px-4 py-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">{emptyMessage}</p>
              {searchQuery && (
                <p className="text-sm text-slate-400">
                  No results for "{searchQuery}"
                </p>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-slate-100">
      {data.map((row, rowIdx) => (
        <TableRow
          key={row.id || rowIdx}
          row={row}
          columns={columns}
          rowIndex={rowIdx}
          striped={striped}
          hoverable={hoverable}
          onClick={onRowClick}
        />
      ))}
    </tbody>
  );
}

// Total row for aggregated values
export function TableTotalRow({ columns, totals, showTotalRow }) {
  if (!showTotalRow || !totals) return null;

  return (
    <tfoot className="bg-slate-800 text-white font-semibold">
      <tr className={ROW_HEIGHT}>
        {columns.map((col, idx) => (
          <td
            key={col.key}
            className={`px-4 py-3 text-sm
              ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
          >
            {idx === 0 ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                TOTAL
              </span>
            ) : totals[col.key] !== undefined ? (
              <span className="text-blue-300">
                {col.totalFormatter ? col.totalFormatter(totals[col.key]) : totals[col.key].toLocaleString()}
              </span>
            ) : '-'}
          </td>
        ))}
      </tr>
    </tfoot>
  );
}

export default TableRow;