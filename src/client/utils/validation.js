// validation.js - Form validation utilities

/**
 * Required field validation
 * @param {string} value - Value to check
 * @returns {boolean} Is valid
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export function isEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
export function isPhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Numeric validation
 * @param {string|number} value - Value to check
 * @returns {boolean} Is valid
 */
export function isNumeric(value) {
  if (value === null || value === undefined) return false;
  return !isNaN(Number(value));
}

/**
 * Positive number validation
 * @param {string|number} value - Value to check
 * @returns {boolean} Is valid
 */
export function isPositiveNumber(value) {
  if (!isNumeric(value)) return false;
  return Number(value) >= 0;
}

/**
 * Integer validation
 * @param {string|number} value - Value to check
 * @returns {boolean} Is valid
 */
export function isInteger(value) {
  if (!isNumeric(value)) return false;
  return Number.isInteger(Number(value));
}

/**
 * Min length validation
 * @param {string} value - Value to check
 * @param {number} min - Minimum length
 * @returns {boolean} Is valid
 */
export function minLength(value, min) {
  if (!value) return false;
  return value.length >= min;
}

/**
 * Max length validation
 * @param {string} value - Value to check
 * @param {number} max - Maximum length
 * @returns {boolean} Is valid
 */
export function maxLength(value, max) {
  if (!value) return true;
  return value.length <= max;
}

/**
 * Min value validation
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @returns {boolean} Is valid
 */
export function minValue(value, min) {
  if (!isNumeric(value)) return false;
  return Number(value) >= min;
}

/**
 * Max value validation
 * @param {number} value - Value to check
 * @param {number} max - Maximum value
 * @returns {boolean} Is valid
 */
export function maxValue(value, max) {
  if (!isNumeric(value)) return true;
  return Number(value) <= max;
}

/**
 * Pattern validation
 * @param {string} value - Value to check
 * @param {RegExp} pattern - Regex pattern
 * @returns {boolean} Is valid
 */
export function matchesPattern(value, pattern) {
  if (!value) return true;
  return pattern.test(value);
}

/**
 * Validate form fields
 * @param {Object} data - Form data
 * @param {Object} rules - Validation rules
 * @returns {Object} Errors object
 */
export function validateForm(data, rules) {
  const errors = {};

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];
    const fieldErrors = [];

    if (fieldRules.required && !isRequired(value)) {
      fieldErrors.push(`${fieldRules.label || field} is required`);
    }

    if (value && fieldRules.email && !isEmail(value)) {
      fieldErrors.push(`${fieldRules.label || field} must be a valid email`);
    }

    if (value && fieldRules.phone && !isPhone(value)) {
      fieldErrors.push(`${fieldRules.label || field} must be a valid phone number`);
    }

    if (fieldRules.minLength && !minLength(value, fieldRules.minLength)) {
      fieldErrors.push(`${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`);
    }

    if (fieldRules.maxLength && !maxLength(value, fieldRules.maxLength)) {
      fieldErrors.push(`${fieldRules.label || field} must be at most ${fieldRules.maxLength} characters`);
    }

    if (fieldRules.min !== undefined && !minValue(value, fieldRules.min)) {
      fieldErrors.push(`${fieldRules.label || field} must be at least ${fieldRules.min}`);
    }

    if (fieldRules.max !== undefined && !maxValue(value, fieldRules.max)) {
      fieldErrors.push(`${fieldRules.label || field} must be at most ${fieldRules.max}`);
    }

    if (fieldRules.pattern && !matchesPattern(value, fieldRules.pattern)) {
      fieldErrors.push(`${fieldRules.label || field} format is invalid`);
    }

    if (fieldRules.custom) {
      const customError = fieldRules.custom(value, data);
      if (customError) fieldErrors.push(customError);
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0];
    }
  });

  return errors;
}

/**
 * Check if form has errors
 * @param {Object} errors - Errors object
 * @returns {boolean} Has errors
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

/**
 * Get first error message
 * @param {Object} errors - Errors object
 * @returns {string} First error message
 */
export function getFirstError(errors) {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
}

export default {
  isRequired,
  isEmail,
  isPhone,
  isNumeric,
  isPositiveNumber,
  isInteger,
  minLength,
  maxLength,
  minValue,
  maxValue,
  matchesPattern,
  validateForm,
  hasErrors,
  getFirstError,
};