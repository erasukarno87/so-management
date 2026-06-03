// constants.js - Centralized constants for the application
// Replaces scattered STATUS_OPTIONS, TYPE_OPTIONS, etc.

export const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-red-100 text-red-700' },
  { value: 'PARTIAL', label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
];

export const DELIVERY_TYPE_OPTIONS = [
  { value: 'Regular', label: 'Regular' },
  { value: 'CKD', label: 'CKD' },
  { value: 'Non Regular', label: 'Non Regular' },
];

export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'ppic', label: 'PPIC' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'qc', label: 'QC' },
  { value: 'viewer', label: 'Viewer' },
];

export const DATE_RANGES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const PAGE_SIZES = [10, 25, 50, 100];

export const ALERT_TYPES = [
  { value: 'DELAY', label: 'Delay' },
  { value: 'QTY_MISMATCH', label: 'Quantity Mismatch' },
  { value: 'DUPLICATE', label: 'Duplicate' },
  { value: 'PREFIX_MISMATCH', label: 'Prefix Mismatch' },
];

export const ALERT_SEVERITIES = [
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

export const BOX_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'SEALED', label: 'Sealed' },
];

export const BATCH_STATUSES = [
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const AMEND_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

// Color variants for status badges
export const STATUS_COLORS = {
  PENDING: { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200' },
  PARTIAL: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
  OPEN: { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200' },
  SEALED: { bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-200' },
};

// Role-based colors
export const ROLE_COLORS = {
  admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
  ppic: { bg: 'bg-blue-100', text: 'text-blue-700' },
  warehouse: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  qc: { bg: 'bg-amber-100', text: 'text-amber-700' },
  viewer: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

// Stat card colors
export const STAT_COLORS = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  red: 'bg-red-50 border-red-200 text-red-600',
  amber: 'bg-amber-50 border-amber-200 text-amber-600',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  slate: 'bg-slate-50 border-slate-200 text-slate-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
};

// Chart colors
export const CHART_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#06b6d4'];

// Helper functions
export function getStatusColor(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.PENDING;
}

export function getRoleColor(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.viewer;
}

export function getStatusLabel(status) {
  const option = STATUS_OPTIONS.find(o => o.value === status);
  return option?.label || status;
}

export function getRoleLabel(role) {
  const option = USER_ROLES.find(o => o.value === role);
  return option?.label || role;
}

export default {
  STATUS_OPTIONS,
  DELIVERY_TYPE_OPTIONS,
  USER_ROLES,
  DATE_RANGES,
  PAGE_SIZES,
  ALERT_TYPES,
  ALERT_SEVERITIES,
  BOX_STATUSES,
  BATCH_STATUSES,
  AMEND_STATUSES,
  STATUS_COLORS,
  ROLE_COLORS,
  STAT_COLORS,
  CHART_COLORS,
  getStatusColor,
  getRoleColor,
  getStatusLabel,
  getRoleLabel,
};