// AlertFilters - Filter controls for alerts
import { memo } from 'react';
import { Filter, X } from 'lucide-react';

export const AlertFilters = memo(function AlertFilters({
  searchTerm, setSearchTerm,
  filters, updateFilter, clearFilters,
  showFilters, setShowFilters, hasActiveFilters,
  typeOptions, severityOptions,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
        >
          <Filter className="w-3.5 h-3.5" /> Filters
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear</button>
        )}
      </div>

      {showFilters && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-3">
          <FilterSelect
            label="Severity"
            value={filters.severity}
            onChange={(v) => updateFilter('severity', v)}
            options={severityOptions}
            placeholder="All Severities"
          />
          <FilterSelect
            label="Type"
            value={filters.type}
            onChange={(v) => updateFilter('type', v)}
            options={typeOptions}
            placeholder="All Types"
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(v) => updateFilter('status', v)}
            options={[
              { value: '', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' },
            ]}
            placeholder="All Status"
          />
        </div>
      )}
    </div>
  );
});

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="text-[10px] font-medium text-slate-500 uppercase mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default AlertFilters;
