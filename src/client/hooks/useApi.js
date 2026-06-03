// useApi - Centralized API client hook
// Provides consistent API calls across all pages

import { useCallback, useState } from 'react';
import api from '../api/client';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (method === 'get') {
        response = await api.get(endpoint);
      } else if (method === 'post') {
        response = await api.post(endpoint, data);
      } else if (method === 'patch') {
        response = await api.patch(endpoint, data);
      } else if (method === 'delete') {
        response = await api.delete(endpoint);
      }
      return response?.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((endpoint) => request('get', endpoint), [request]);
  const post = useCallback((endpoint, data) => request('post', endpoint, data), [request]);
  const patch = useCallback((endpoint, data) => request('patch', endpoint, data), [request]);
  const del = useCallback((endpoint) => request('delete', endpoint), [request]);

  return { loading, error, get, post, patch, delete: del };
}

export function useAsyncApi() {
  const [state, setState] = useState({ data: null, loading: false, error: null });

  const execute = useCallback(async (method, endpoint, data = null) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      let response;
      if (method === 'get') {
        response = await api.get(endpoint);
      } else if (method === 'post') {
        response = await api.post(endpoint, data);
      } else if (method === 'patch') {
        response = await api.patch(endpoint, data);
      } else if (method === 'delete') {
        response = await api.delete(endpoint);
      }
      setState({ data: response?.data, loading: false, error: null });
      return response?.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setState({ data: null, loading: false, error: errorMessage });
      throw err;
    }
  }, []);

  const get = useCallback((endpoint) => execute('get', endpoint), [execute]);
  const post = useCallback((endpoint, data) => execute('post', endpoint, data), [execute]);
  const patch = useCallback((endpoint, data) => execute('patch', endpoint, data), [execute]);
  const del = useCallback((endpoint) => execute('delete', endpoint), [execute]);

  return { ...state, get, post, patch, delete: del };
}

export default useApi;