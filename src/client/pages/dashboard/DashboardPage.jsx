// DashboardPage - Main dashboard page
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Package, Activity, CheckCircle, Factory, CalendarClock, AlertTriangle } from 'lucide-react';
import api from '../../api/client';
import { useStats, useFilters } from '../../hooks';
import { CHART_COLORS, DATE_RANGES, STATUS_OPTIONS } from '../../utils/constants';
import { StatCard } from '../../components/ui';
import { FilterBar } from './FilterBar';
import { StatsCards } from './StatsCards';
import { ChartsGrid } from './ChartsGrid';

function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  const {
    filters: filterState,
    setFilters: setFilterState,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  } = useFilters({ initialFilters: { status: 'all', destination: 'all' } });

  const [dateRange, setDateRange] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [poResponse, alertsResponse] = await Promise.all([
        api.get('/sales-orders'),
        api.get('/alerts'),
      ]);
      setOrders(poResponse.data || []);
      setAlerts(alertsResponse.data?.alerts || alertsResponse.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Get unique destinations
  const destinations = useMemo(() => {
    const dests = [...new Set(orders.map(o => o.delivery_destination).filter(Boolean))];
    return [{ value: 'all', label: 'All Destinations' }, ...dests.map(d => ({ value: d, label: d }))];
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    if (filterState.status !== 'all') {
      filtered = filtered.filter(o => o.status === filterState.status);
    }
    if (filterState.destination !== 'all') {
      filtered = filtered.filter(o => o.delivery_destination === filterState.destination);
    }
    if (dateRange === 'daily') {
      filtered = filtered.filter(o => o.delivery_date?.split('T')[0] === selectedDate);
    }
    return filtered;
  }, [orders, filterState, dateRange, selectedDate]);

  // Stats hook
  const stats = useStats(filteredOrders, {
    statusField: 'status',
    sumFields: ['total_qty_plan', 'total_qty_actual'],
    dateField: 'delivery_date',
  });

  // Chart data
  const chartData = useMemo(() => {
    if (!filteredOrders.length) return [];
    const sorted = [...filteredOrders].sort((a, b) => new Date(a.delivery_date || 0) - new Date(b.delivery_date || 0));
    if (dateRange === 'daily') {
      return sorted.map(o => ({ name: o.so_number?.slice(-8) || o.id?.slice(-8) || 'N/A', plan: Number(o.total_qty_plan || 0), actual: Number(o.total_qty_actual || 0) }));
    }
    if (dateRange === 'weekly') {
      const grouped = {};
      sorted.forEach(o => {
        const date = new Date(o.delivery_date || Date.now());
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const key = weekStart.toISOString().split('T')[0];
        if (!grouped[key]) grouped[key] = { plan: 0, actual: 0 };
        grouped[key].plan += Number(o.total_qty_plan || 0);
        grouped[key].actual += Number(o.total_qty_actual || 0);
      });
      return Object.entries(grouped).map(([name, data]) => ({ name: `W${Math.ceil(new Date(name).getDate() / 7)}`, plan: data.plan, actual: data.actual })).slice(-8);
    }
    if (dateRange === 'monthly') {
      const grouped = {};
      sorted.forEach(o => {
        const month = (o.delivery_date || '').slice(0, 7) || 'Unknown';
        if (!grouped[month]) grouped[month] = { plan: 0, actual: 0 };
        grouped[month].plan += Number(o.total_qty_plan || 0);
        grouped[month].actual += Number(o.total_qty_actual || 0);
      });
      return Object.entries(grouped).map(([name, data]) => ({ name: name.slice(2), plan: data.plan, actual: data.actual })).slice(-6);
    }
    return [];
  }, [filteredOrders, dateRange, selectedDate]);

  const statusPie = useMemo(() => [
    { name: 'Pending', value: stats.pending },
    { name: 'In Progress', value: stats.partial },
    { name: 'Completed', value: stats.completed },
  ].filter(d => d.value > 0), [stats]);

  const deliveryTypeData = useMemo(() => {
    const t = {};
    filteredOrders.forEach(o => {
      const type = o.delivery_type || 'Standard';
      t[type] = (t[type] || 0) + 1;
    });
    return Object.entries(t).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  const bucketData = useMemo(() => {
    const b = {};
    filteredOrders.forEach(o => {
      const bucket = o.bucket_no || 'N/A';
      if (!b[bucket]) b[bucket] = { plan: 0, actual: 0 };
      b[bucket].plan += Number(o.total_qty_plan || 0);
      b[bucket].actual += Number(o.total_qty_actual || 0);
    });
    return Object.entries(b).map(([name, data]) => ({ name, plan: data.plan, actual: data.actual })).sort((a, b) => b.plan - a.plan).slice(0, 8);
  }, [filteredOrders]);

  const destinationData = useMemo(() => {
    const d = {};
    filteredOrders.forEach(o => {
      const dest = o.delivery_destination || 'Unknown';
      if (!d[dest]) d[dest] = { plan: 0, actual: 0 };
      d[dest].plan += Number(o.total_qty_plan || 0);
      d[dest].actual += Number(o.total_qty_actual || 0);
    });
    return Object.entries(d).map(([name, data]) => ({ name, plan: data.plan, actual: data.actual })).sort((a, b) => b.plan - a.plan).slice(0, 5);
  }, [filteredOrders]);

  const unreadAlerts = useMemo(() => alerts.filter(a => !a.is_read).length, [alerts]);
  const otif = stats.totalPlan > 0 ? ((stats.totalActual / stats.totalPlan) * 100).toFixed(0) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <StatsCards stats={stats} unreadAlerts={unreadAlerts} />
      <FilterBar
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        statusFilter={filterState.status}
        setStatusFilter={(v) => updateFilter('status', v)}
        destinationFilter={filterState.destination}
        setDestinationFilter={(v) => updateFilter('destination', v)}
        destinations={destinations}
        stats={stats}
        otif={otif}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
      <ChartsGrid
        chartData={chartData}
        statusPie={statusPie}
        deliveryTypeData={deliveryTypeData}
        bucketData={bucketData}
        destinationData={destinationData}
      />
    </div>
  );
}

export default DashboardPage;