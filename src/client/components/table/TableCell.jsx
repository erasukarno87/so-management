// TableCell - Cell helper components for DataTable
// Reusable cell renderers for common data types

import { useMemo } from 'react';

// Badge cell renderer
export function BadgeCell({ value, variants = {} }) {
  const variant = variants[value] || 'default';
  const styles = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[variant] || styles.default}`}>
      {value}
    </span>
  );
}

// Number cell with formatting
export function NumberCell({ value, format = 'number', color, className = '' }) {
  const formatted = useMemo(() => {
    if (value === null || value === undefined) return '-';
    if (format === 'currency') return `$${Number(value).toLocaleString()}`;
    if (format === 'percent') return `${Number(value).toFixed(1)}%`;
    if (format === 'decimal') return Number(value).toFixed(2);
    return Number(value).toLocaleString();
  }, [value, format]);

  return <span className={`${color || ''} ${className}`}>{formatted}</span>;
}

// Date cell with formatting
export function DateCell({ value, format = 'date', className = '' }) {
  if (!value) return <span className="text-slate-400">-</span>;

  const date = new Date(value);
  if (isNaN(date.getTime())) return <span className="text-slate-400">-</span>;

  const formatted = useMemo(() => {
    switch (format) {
      case 'datetime':
        return date.toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      case 'time':
        return date.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' });
      case 'short':
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      default:
        return date.toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
    }
  }, [value, format]);

  return <span className={`text-slate-600 ${className}`}>{formatted}</span>;
}

// Boolean cell with icon
export function BoolCell({ value, trueLabel = 'Yes', falseLabel = 'No', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${value ? 'text-emerald-600' : 'text-slate-400'} ${className}`}>
      {value ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {trueLabel}
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {falseLabel}
        </>
      )}
    </span>
  );
}

// Truncated text cell
export function TruncateCell({ value, maxLength = 50, className = '' }) {
  if (!value) return <span className="text-slate-400">-</span>;

  const displayValue = value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;

  return (
    <span className={`${className}`} title={value}>
      {displayValue}
    </span>
  );
}

// Code/monospace cell
export function CodeCell({ value, className = '' }) {
  return (
    <span className={`font-mono font-semibold text-blue-600 ${className}`}>
      {value}
    </span>
  );
}

// Avatar cell with initials
export function AvatarCell({ value, src, className = '' }) {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={value}
        className={`w-8 h-8 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold ${className}`}>
      {getInitials(value)}
    </div>
  );
}

// Color dot indicator
export function StatusDot({ status, colors = {} }) {
  const defaultColors = {
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    pending: 'bg-amber-500',
    error: 'bg-red-500',
  };

  const bgColor = colors[status] || defaultColors[status] || 'bg-slate-400';

  return <span className={`inline-block w-2 h-2 rounded-full ${bgColor}`} />;
}

// Default export with all cell types
export default {
  BadgeCell,
  NumberCell,
  DateCell,
  BoolCell,
  TruncateCell,
  CodeCell,
  AvatarCell,
  StatusDot,
};