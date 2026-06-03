// ReportTypeSelector - Grid of report type cards
import { RefreshCw, Download, Printer } from 'lucide-react';

const ICONS = {
  Package: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  FileText: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2 2 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  BarChart3: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  ClipboardList: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
};

export function ReportTypeSelector({ reportTypes, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {reportTypes.map((report) => {
        const Icon = ICONS[report.icon] || ICONS.BarChart3;
        const colorClasses = {
          blue: 'bg-blue-500 group-hover:bg-blue-600',
          green: 'bg-green-500 group-hover:bg-green-600',
          amber: 'bg-amber-500 group-hover:bg-amber-600',
          purple: 'bg-purple-500 group-hover:bg-purple-600',
          teal: 'bg-teal-500 group-hover:bg-teal-600',
          slate: 'bg-slate-500 group-hover:bg-slate-600',
        };

        return (
          <button
            key={report.id}
            onClick={() => onSelect(report.id)}
            className="group bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${colorClasses[report.color] || colorClasses.slate} flex items-center justify-center text-white shrink-0`}>
                <Icon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{report.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{report.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ReportTypeSelector;