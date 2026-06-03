// FilterBar - Dashboard filter controls
import { CalendarDays, Filter, X } from 'lucide-react';
import { DATE_RANGES, STATUS_OPTIONS } from '../../utils/constants';

export function FilterBar({
  dateRange, setDateRange, selectedDate, setSelectedDate,
  statusFilter, setStatusFilter, destinationFilter, setDestinationFilter,
  destinations, stats, otif, hasActiveFilters, onClearFilters
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Filter */}
          <DateRangeSelector dateRange={dateRange} onChange={setDateRange} />

          {/* Date Picker for Daily */}
          {dateRange === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-100 border-0 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          )}

          <div className="h-6 w-px bg-slate-200 hidden lg:block" />

          {/* Status Filter */}
          <FilterDropdown
            label="Status"
            icon={Filter}
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />

          {/* Destination Filter */}
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="bg-slate-100 border-0 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {destinations.map(dest => (
              <option key={dest.value} value={dest.value}>{dest.label}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Summary Pills */}
        <SummaryPills stats={stats} otif={otif} />
      </div>
    </div>
  );
}

function DateRangeSelector({ dateRange, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <CalendarDays className="w-4 h-4 text-slate-400" />
      <div className="flex bg-slate-100 rounded-lg p-0.5 gap-1 text-xs">
        {DATE_RANGES.map(range => (
          <button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              dateRange === range.value ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterDropdown({ label, icon: Icon, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-100 border-0 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option value="all">All {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function SummaryPills({ stats, otif }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
        Plan: <span className="font-bold">{stats.totalPlan.toLocaleString()}</span>
      </span>
      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
        Actual: <span className="font-bold">{stats.totalActual.toLocaleString()}</span>
      </span>
      <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium">
        Remaining: <span className="font-bold">{stats.remaining.toLocaleString()}</span>
      </span>
      <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium">
        Overdue: <span className="font-bold">{stats.overdue}</span>
      </span>
      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
        OTIF: <span className="font-bold">{otif}%</span>
      </span>
    </div>
  );
}

export default FilterBar;