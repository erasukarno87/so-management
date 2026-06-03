// useFilters - Generic filter state management hook
// Handles search, dropdown filters, and filter clearing

import { useState, useCallback, useMemo, useRef } from 'react';

export function useFilters(options = {}) {
  const {
    initialFilters = {},
  } = options;

  // Memoize initialFilters to prevent dependency changes
  const initialFiltersRef = useRef(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFiltersRef.current);
    setSearchTerm('');
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFiltersRef.current);
    setSearchTerm('');
  }, []);

  const hasActiveFilters = useMemo(() => {
    const filterValues = Object.values(filters);
    const hasFilters = filterValues.some(v => v && v !== '' && v !== null && v !== undefined && v !== 'all');
    const hasSearch = searchTerm.trim() !== '';
    return hasFilters || hasSearch;
  }, [filters, searchTerm]);

  const activeFilterCount = useMemo(() => {
    let count = searchTerm.trim() ? 1 : 0;
    Object.values(filters).forEach(v => {
      if (v && v !== '' && v !== null && v !== undefined && v !== 'all') count++;
    });
    return count;
  }, [filters, searchTerm]);

  return {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    updateFilter,
    clearFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}

export function useFilterData(data, filters, searchTerm, searchFields = []) {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let filtered = [...data];

    if (searchTerm && searchFields.length > 0) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(term);
        })
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) return;
      filtered = filtered.filter(item => item[key] === value);
    });

    return filtered;
  }, [data, filters, searchTerm, searchFields]);
}

export default useFilters;
