// StatusBadge - Reusable status badge component
import { STATUS_OPTIONS, getStatusColor } from '../../utils/constants';

export function StatusBadge({ status, label, size = 'default' }) {
  const colors = getStatusColor(status);
  const statusOption = STATUS_OPTIONS.find(o => o.value === status);
  const displayLabel = label || statusOption?.label || status;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    default: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${colors.bg} ${colors.text} ${sizeClasses[size]}`}>
      {displayLabel}
    </span>
  );
}

export function RoleBadge({ role, size = 'default' }) {
  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    ppic: 'bg-blue-100 text-blue-700',
    warehouse: 'bg-emerald-100 text-emerald-700',
    qc: 'bg-amber-100 text-amber-700',
    viewer: 'bg-slate-100 text-slate-700',
  };

  const roleLabels = {
    admin: 'Admin',
    ppic: 'PPIC',
    warehouse: 'Warehouse',
    qc: 'QC',
    viewer: 'Viewer',
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    default: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${roleColors[role] || roleColors.viewer} ${sizeClasses[size]}`}>
      {roleLabels[role]?.toUpperCase() || role?.toUpperCase()}
    </span>
  );
}

export function AlertBadge({ severity, size = 'default' }) {
  const severityColors = {
    critical: 'bg-red-100 text-red-700 ring-red-200',
    warning: 'bg-amber-100 text-amber-700 ring-amber-200',
    info: 'bg-blue-100 text-blue-700 ring-blue-200',
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    default: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ring-1 ring-inset ${severityColors[severity] || severityColors.info} ${sizeClasses[size]}`}>
      {severity?.toUpperCase()}
    </span>
  );
}

export function CountBadge({ count, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-600 text-white',
    red: 'bg-red-600 text-white',
    green: 'bg-emerald-600 text-white',
    amber: 'bg-amber-600 text-white',
    slate: 'bg-slate-600 text-white',
  };

  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${colorClasses[color] || colorClasses.blue}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default StatusBadge;