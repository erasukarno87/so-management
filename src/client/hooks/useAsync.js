// useAsync - Async operation state management
// Provides loading, error, and data states for async operations

import { useState, useCallback } from 'react';

export function useAsync(asyncFunction) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFunction(...args);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export function useAsyncList(getListFunction) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getListFunction();
      setItems(response?.data || response || []);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getListFunction]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const addItem = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);

  const updateItem = useCallback((id, updates) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return { items, loading, error, load, refresh, addItem, updateItem, removeItem };
}

export default useAsync;