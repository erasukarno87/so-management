// EmptyState - Reusable empty state component

import { Search } from 'lucide-react';

export function EmptyState({ icon: Icon = Search, title, description, action, actionLabel, actionIcon: ActionIcon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyTable({ columns = 5, message = 'No data available', searchTerm = '' }) {
  return (
    <tr>
      <td colSpan={columns} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">{message}</p>
          {searchTerm && (
            <p className="text-sm text-slate-400">
              No results for "{searchTerm}"
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

export function EmptyCard({ title, description, action, actionLabel, actionIcon: ActionIcon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
      <EmptyState
        title={title}
        description={description}
        action={action}
        actionLabel={actionLabel}
        actionIcon={ActionIcon}
      />
    </div>
  );
}

export default EmptyState;