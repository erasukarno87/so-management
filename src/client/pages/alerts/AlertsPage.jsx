// AlertsPage - Main alerts page
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../../api/client';
import { DataTable } from '../../components/DataTable';
import { ViewModal, DeleteModal } from '../../components/modals';
import { useToast, useFilters, useStats } from '../../hooks';
import { AlertFilters } from './AlertFilters';
import { AlertStats } from './AlertStats';

const TYPE_OPTIONS = [
  { value: 'DELAY', label: 'Delay' },
  { value: 'QTY_MISMATCH', label: 'Qty Mismatch' },
  { value: 'DUPLICATE', label: 'Duplicate' },
  { value: 'PREFIX_MISMATCH', label: 'Prefix Mismatch' },
];

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

function AlertsPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    filters,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  } = useFilters({ initialFilters: { severity: '', type: '', status: '' } });

  const [viewModal, setViewModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/alerts');
      setAlerts(response.data.alerts || response.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load alerts');
      toastRef.current.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (searchTerm && !a.message?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !a.so_number?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filters.severity && a.severity !== filters.severity) return false;
      if (filters.type && a.type !== filters.type) return false;
      if (filters.status === 'unread' && a.is_read) return false;
      if (filters.status === 'read' && !a.is_read) return false;
      return true;
    });
  }, [alerts, searchTerm, filters]);

  const stats = useStats(filteredAlerts, { statusField: 'severity' });

  const handleView = (alert) => setViewModal({ open: true, data: alert });
  const handleDelete = (alert) => setDeleteModal({ open: true, data: alert });

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/alerts/${deleteModal.data.id}`);
      toastRef.current.success('Alert deleted successfully');
      setDeleteModal({ open: false, data: null });
      loadAlerts();
    } catch (err) {
      toastRef.current.error('Failed to delete alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'severity', label: 'Severity', sortable: true,
      render: v => <SeverityBadge severity={v} />
    },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'message', label: 'Message' },
    { key: 'so_number', label: 'SO Number', sortable: true },
    {
      key: 'is_read', label: 'Status', sortable: true,
      render: v => v ? <span className="text-slate-400">Read</span> : <span className="text-blue-600 font-medium">Unread</span>
    },
    { key: 'created_at', label: 'Time', sortable: true, render: v => new Date(v).toLocaleString('en-GB') },
    {
      key: 'actions', label: '', align: 'right',
      render: (_, alert) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => handleView(alert)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button onClick={() => handleDelete(alert)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-9V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ];

  const viewFields = [
    { key: 'type', label: 'Type' },
    { key: 'severity', label: 'Severity' },
    { key: 'message', label: 'Message' },
    { key: 'so_number', label: 'SO Number' },
    { key: 'created_at', label: 'Created', type: 'datetime' },
    { key: 'is_read', label: 'Read' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">{filteredAlerts.length} alerts</p>
        </div>
        <button onClick={loadAlerts} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A2 2 0 0118.436 9l-3.172 3.172M20.418 12.582A2 2 0 0118 14.436L12 20.418M4 20v-5h.581" /></svg>
        </button>
      </div>

      <AlertStats alerts={filteredAlerts} />

      <AlertFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
        typeOptions={TYPE_OPTIONS}
        severityOptions={SEVERITY_OPTIONS}
      />

      <DataTable columns={columns} data={filteredAlerts} loading={loading} error={error} pageSize={15} emptyMessage="No alerts" />

      <ViewModal isOpen={viewModal.open} onClose={() => setViewModal({ open: false, data: null })} title="Alert Details" data={viewModal.data} fields={viewFields} />

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, data: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Alert"
        message={`Delete this alert?`}
        isLoading={isSubmitting}
      />
    </div>
  );
}

function SeverityBadge({ severity }) {
  const styles = {
    critical: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[severity] || styles.info}`}>{severity?.toUpperCase()}</span>;
}

export default AlertsPage;