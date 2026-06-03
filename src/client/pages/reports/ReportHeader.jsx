// ReportHeader - Report action buttons
import { RefreshCw, Download, Printer } from 'lucide-react';

export function ReportHeader({ onRefresh, onExport, onPrint, isExporting }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onRefresh}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Refresh
      </button>
      <button
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50"
      >
        <Download className="w-3.5 h-3.5" />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
      <button
        onClick={onPrint}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
      >
        <Printer className="w-3.5 h-3.5" />
        Print
      </button>
    </div>
  );
}

export default ReportHeader;