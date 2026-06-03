// Customers page - Professional version with full CRUD
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/client';
import { DataTable } from '../components/DataTable';
import { ViewModal, FormModal, DeleteModal } from '../components/Modal';
import { Plus, Trash2, Eye, Edit2, RefreshCw } from 'lucide-react';

function Customers() {
  const toast = window.__TOAST__;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modal states
  const [viewModal, setViewModal] = useState({ open: false, data: null });
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/customers');
      setCustomers(response.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError(err.response?.data?.error?.message || 'Failed to load customers');
      toast?.error?.('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  // Filtered data
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (searchTerm && !c.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !c.address?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !c.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !c.phone?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [customers, searchTerm]);

  // Stats
  const stats = useMemo(() => ({
    total: filteredCustomers.length,
    withContact: filteredCustomers.filter(c => c.contact_person).length,
    withPhone: filteredCustomers.filter(c => c.phone).length,
  }), [filteredCustomers]);

  const clearFilters = () => setSearchTerm('');
  const hasActiveFilters = searchTerm;

  // Selection handlers
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  // CRUD handlers
  const handleView = (customer) => setViewModal({ open: true, data: customer });
  const handleCreate = () => setFormModal({ open: true, data: null });
  const handleEdit = (customer) => setFormModal({ open: true, data: customer });
  const handleDelete = (customer) => setDeleteModal({ open: true, data: customer });

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await api.patch(`/customers/${formData.id}`, formData);
        toast?.success?.('Customer updated successfully');
      } else {
        await api.post('/customers', formData);
        toast?.success?.('Customer created successfully');
      }
      setFormModal({ open: false, data: null });
      loadCustomers();
    } catch (err) {
      console.error('Save failed:', err);
      toast?.error?.(err.response?.data?.error?.message || 'Failed to save');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/customers/${deleteModal.data.id}`);
      toast?.success?.('Customer deleted successfully');
      setDeleteModal({ open: false, data: null });
      loadCustomers();
    } catch (err) {
      console.error('Delete failed:', err);
      toast?.error?.(err.response?.data?.error?.message || 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export
  const handleExport = () => {
    const headers = ['Name', 'Address', 'Contact Person', 'Phone'];
    const rows = filteredCustomers.map(c => [c.name, c.address, c.contact_person, c.phone]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast?.success?.(`Exported ${filteredCustomers.length} customers`);
  };

  // Table columns
  const columns = [
    {
      key: 'checkbox',
      label: '',
      width: 'w-10',
      render: (_, customer) => (
        <button onClick={() => toggleSelect(customer.id)} className="p-1">
          <span className={`w-4 h-4 block rounded ${selectedIds.has(customer.id) ? 'bg-blue-600' : 'border-2 border-slate-300'}`} />
        </button>
      ),
    },
    { key: 'name', label: 'Customer Name', sortable: true, render: (v) => <span className="font-semibold">{v}</span> },
    { key: 'address', label: 'Address', render: (v) => <span className="text-slate-600 truncate max-w-xs">{v || '-'}</span> },
    { key: 'contact_person', label: 'Contact', sortable: true, render: (v) => v ? <span className="text-slate-700">{v}</span> : <span className="text-slate-400">-</span> },
    { key: 'phone', label: 'Phone', sortable: true, render: (v) => <span className="font-mono text-slate-700">{v || '-'}</span> },
    {
      key: 'actions', label: 'Actions', width: 'w-24', align: 'right', sortable: false,
      render: (_, customer) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => handleView(customer)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => handleEdit(customer)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(customer)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // View modal fields
  const viewFields = [
    { key: 'name', label: 'Customer Name' },
    { key: 'address', label: 'Address', fullWidth: true },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'phone', label: 'Phone' },
  ];

  // Form modal fields
  const formFields = [
    { key: 'name', label: 'Customer Name', required: true, placeholder: 'Enter customer name' },
    { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter full address', fullWidth: true },
    { key: 'contact_person', label: 'Contact Person', placeholder: 'Enter contact person name' },
    { key: 'phone', label: 'Phone', placeholder: 'Enter phone number' },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Customers</h1>
          <p className="text-xs text-slate-500 mt-0.5">{filteredCustomers.length} customers</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadCustomers} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">
            Export
          </button>
          <button onClick={handleCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
            <Plus className="w-3.5 h-3.5" />
            New Customer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-[10px] text-slate-500">Total Customers</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div className="text-xl font-bold text-emerald-600">{stats.withContact}</div>
          <div className="text-[10px] text-slate-500">With Contact</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-xl font-bold text-amber-600">{stats.withPhone}</div>
          <div className="text-[10px] text-slate-500">With Phone</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, address, contact..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <button onClick={toggleSelectAll} className="text-xs text-blue-600 hover:underline">
            {selectedIds.size === filteredCustomers.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        loading={loading}
        error={error}
        pageSize={10}
        onRowClick={handleView}
        emptyMessage="No customers found"
      />

      {/* View Modal */}
      <ViewModal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, data: null })}
        title="Customer Details"
        data={viewModal.data}
        fields={viewFields}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, data: null })}
        onSubmit={handleSubmit}
        title={formModal.data ? 'Edit Customer' : 'Create Customer'}
        fields={formFields}
        initialData={formModal.data}
        isLoading={isSubmitting}
        submitLabel={formModal.data ? 'Update' : 'Create'}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, data: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteModal.data?.name}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default Customers;
