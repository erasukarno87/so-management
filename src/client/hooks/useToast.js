// useToast - Centralized toast notification hook
// Replaces window.__TOAST__ pattern across all pages

import { useCallback } from 'react';

export function useToast() {
  const showToast = useCallback((type, message, duration = 3000) => {
    if (window.__TOAST__) {
      window.__TOAST__[type]?.(message, duration);
    }
  }, []);

  const success = useCallback((message, duration) => {
    showToast('success', message, duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    showToast('error', message, duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    showToast('info', message, duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    showToast('warning', message, duration);
  }, [showToast]);

  return { success, error, info, warning };
}

export default useToast;