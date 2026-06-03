// formatters.js - Date, number, and text formatting utilities
// Centralized formatting functions used across the application

/**
 * Format a date value to locale string
 * @param {string|Date} value - Date to format
 * @param {string} locale - Locale string (default: 'en-GB')
 * @returns {string} Formatted date string
 */
export function formatDate(value, locale = 'en-GB') {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date with time
 * @param {string|Date} value - Date to format
 * @param {string} locale - Locale string
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(value, locale = 'en-GB') {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format to short date (day.month)
 * @param {string|Date} value - Date to format
 * @returns {string} Short date string
 */
export function formatShortDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

/**
 * Format to time only
 * @param {string|Date} value - Date to format
 * @returns {string} Time string (HH:mm)
 */
export function formatTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format date for HTML date input (yyyy-MM-dd)
 * @param {string|Date} value - Date to format
 * @returns {string} HTML-compatible date string
 */
export function formatDateForInput(value) {
  if (!value) return '';
  if (typeof value === 'string' && value.includes('T')) {
    return value.split('T')[0];
  }
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  return value;
}

/**
 * Get today's date as yyyy-MM-dd string
 * @returns {string} Today's date
 */
export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format number with locale support
 * @param {number|string} value - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '-';
  const num = Number(value);
  if (isNaN(num)) return '-';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency (USD)
 * @param {number|string} value - Amount
 * @returns {string} Formatted currency
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '-';
  return `$${Number(value).toLocaleString()}`;
}

/**
 * Format percentage
 * @param {number|string} value - Percentage value
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes
 * @param {number} decimals - Decimal places
 * @returns {string} Human readable size
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '-';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse JSON safely
 * @param {string} json - JSON string
 * @param {*} fallback - Default value if parse fails
 * @returns {*} Parsed object or fallback
 */
export function parseJSON(json, fallback = null) {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, txt =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export default {
  formatDate,
  formatDateTime,
  formatShortDate,
  formatTime,
  formatDateForInput,
  getTodayDate,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatBytes,
  truncate,
  formatRelativeTime,
  getInitials,
  generateId,
  parseJSON,
  capitalize,
  toTitleCase,
};