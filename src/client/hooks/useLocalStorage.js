// useLocalStorage - localStorage abstraction hook
// Handles serialization and provides reactive state

import { useState, useCallback, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Initialize state from localStorage or default
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      return valueToStore;
    });
  }, []);

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;