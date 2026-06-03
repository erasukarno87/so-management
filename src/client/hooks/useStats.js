// useStats - Stats calculation hook
// Centralizes stats computation for Dashboard, SalesOrders, etc.

import { useMemo } from 'react';

export function useStats(data, options = {}) {
  const {
    statusField = 'status',
    sumFields = [],
    dateField = 'delivery_date',
    countByField = null,
  } = options;

  return useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        total: 0,
        pending: 0,
        partial: 0,
        completed: 0,
        totalPlan: 0,
        totalActual: 0,
        remaining: 0,
        completionRate: 0,
      };
    }

    const total = data.length;
    const completed = data.filter(o => o[statusField] === 'COMPLETED').length;
    const pending = data.filter(o => o[statusField] === 'PENDING').length;
    const partial = data.filter(o => o[statusField] === 'PARTIAL').length;

    const totalPlan = sumFields.includes('total_qty_plan')
      ? data.reduce((s, o) => s + Number(o.total_qty_plan || 0), 0)
      : 0;

    const totalActual = sumFields.includes('total_qty_actual')
      ? data.reduce((s, o) => s + Number(o.total_qty_actual || 0), 0)
      : 0;

    const remaining = totalPlan - totalActual;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(0) : 0;

    // Date-based stats
    const now = new Date();
    const due3Days = dateField
      ? data.filter(o => {
          if (!o[dateField] || o[statusField] === 'COMPLETED') return false;
          const diff = (new Date(o[dateField]) - now) / 86400000;
          return diff >= 0 && diff <= 3;
        }).length
      : 0;

    const overdue = dateField
      ? data.filter(o => {
          if (!o[dateField] || o[statusField] === 'COMPLETED') return false;
          return new Date(o[dateField]) < now;
        }).length
      : 0;

    return {
      total,
      completed,
      pending,
      partial,
      totalPlan,
      totalActual,
      remaining,
      completionRate: Number(completionRate),
      due3Days,
      overdue,
    };
  }, [data, statusField, sumFields, dateField]);
}

export function useStatusStats(data, statusField = 'status') {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const counts = {};
    data.forEach(item => {
      const status = item[statusField] || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [data, statusField]);
}

export function useGroupStats(data, groupByField, sumFields = []) {
  return useMemo(() => {
    if (!data || !Array.isArray(data) || !groupByField) return [];

    const groups = {};
    data.forEach(item => {
      const key = item[groupByField] || 'Unknown';
      if (!groups[key]) {
        groups[key] = { count: 0, plan: 0, actual: 0 };
      }
      groups[key].count++;
      if (sumFields.includes('total_qty_plan')) {
        groups[key].plan += Number(item.total_qty_plan || 0);
      }
      if (sumFields.includes('total_qty_actual')) {
        groups[key].actual += Number(item.total_qty_actual || 0);
      }
    });

    return Object.entries(groups)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count);
  }, [data, groupByField, sumFields]);
}

export default useStats;