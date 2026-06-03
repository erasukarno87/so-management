// Products page - Professional version with full CRUD
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/client';
import { DataTable } from '../components/DataTable';
import { ViewModal, FormModal, DeleteModal } from '../components/Modal';
import { Plus, Trash2, Eye, Edit2, RefreshCw, Filter } from 'lucide-react';

function Products() {
  const toast = window.__TOAST__;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrefix, setFilterPrefix] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modal states
  const [viewModal, setViewModal] = useState({ open: false, data: null });
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.response?.data?.error?.message || 'Failed to load products');
      toast?.error?.('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Get unique prefixes
  const prefixes = useMemo(() => {
    const p = [...new Set(products.map(pr => pr.prefix).filter(Boolean))];
    return p.sort();
  }, [products]);

  // Filtered data
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (searchTerm && !p.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !p.model_code?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !p.prefix?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !p.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterPrefix && p.prefix !== filterPrefix) return false;
      return true;
    });
  }, [products, searchTerm, filterPrefix]);

  // Stats
  const stats = useMemo(() => ({
    total: filteredProducts.length,
    totalCapacity: filteredProducts.reduce((s, p) => s + Number(p.box_capacity || 0), 0),
    avgCapacity: filteredProducts.length > 0 ? Math.round(filteredProducts.reduce((s, p) => s + Number(p.box_capacity || 0), 0) / filteredProducts.length) : 0,
  }), [filteredProducts]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPrefix('');
  };

  const hasActiveFilters = searchTerm || filterPrefix;

  // Selection handlers
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // CRUD handlers
  const handleView = (product) => setViewModal({ open: true, data: product });
  const handleCreate = () => setFormModal({ open: true, data: null });
  const handleEdit = (product) => setFormModal({ open: true, data: product });
  const handleDelete = (product) => setDeleteModal({ open: true, data: product });

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await api.patch(`/products/${formData.id}`, formData);
        toast?.success?.('Product updated successfully');
      } else {
        await api.post('/products', formData);
        toast?.success?.('Product created successfully');
      }
      setFormModal({ open: false, data: null });
      loadProducts();
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
      await api.delete(`/products/${deleteModal.data.id}`);
      toast?.success?.('Product deleted successfully');
      setDeleteModal({ open: false, data: null });
      loadProducts();
    } catch (err) {
      console.error('Delete failed:', err);
      toast?.error?.(err.response?.data?.error?.message || 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export
  const handleExport = () => {
    const headers = ['Part Number', 'Model Code', 'Prefix', 'Box Capacity', 'Description'];
    const rows = filteredProducts.map(p => [p.part_number, p.model_code, p.prefix, p.box_capacity, p.description]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast?.success?.(`Exported ${filteredProducts.length} products`);
  };

  // Table columns
  const columns = [
    {
      key: 'checkbox',
      label: '',
      width: 'w-10',
      render: (_, product) => (
        <button onClick={() => toggleSelect(product.id)} className="p-1">
          <span className={`w-4 h-4 block rounded ${selectedIds.has(product.id) ? 'bg-blue-600' : 'border-2 border-slate-300'}`} />
        </button>
      ),
    },
    { key: 'part_number', label: 'Part Number', sortable: true, render: (v) => <span className="font-mono font-semibold text-blue-700">{v}</span> },
    { key: 'model_code', label: 'Model Code', sortable: true, render: (v) => <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{v}</span> },
    { key: 'prefix', label: 'Prefix', sortable: true, render: (v) => <span className="font-mono text-emerald-700">{v}</span> },
    { key: 'box_capacity', label: 'Capacity', sortable: true, align: 'center', render: (v) => <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 rounded-full font-bold text-xs">{v}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="text-slate-600 truncate max-w-xs">{v || '-'}</span> },
    {
      key: 'actions', label: 'Actions', width: 'w-24', align: 'right', sortable: false,
      render: (_, product) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => handleView(product)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600" title="View">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => handleEdit(product)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(product)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // View modal fields
  const viewFields = [
    { key: 'part_number', label: 'Part Number' },
    { key: 'model_code', label: 'Model Code' },
    { key: 'prefix', label: 'Prefix' },
    { key: 'box_capacity', label: 'Box Capacity', type: 'number' },
    { key: 'description', label: 'Description', fullWidth: true },
  ];

  // Form modal fields
  const formFields = [
    { key: 'part_number', label: 'Part Number', required: true, placeholder: 'Enter part number' },
    { key: 'model_code', label: 'Model Code', required: true, placeholder: 'Enter model code' },
    { key: 'prefix', label: 'Prefix', required: true, placeholder: 'e.g., SJ01' },
    { key: 'box_capacity', label: 'Box Capacity', type: 'number', required: true, placeholder: 'Default: 10' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Product description...', fullWidth: true },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Products</h1>
          <p className="text-xs text-slate-500 mt-0.5">{filteredProducts.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadProducts} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">
            Export
          </button>
          <button onClick={handleCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
            <Plus className="w-3.5 h-3.5" />
            New Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-[10px] text-slate-500">Total Products</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div className="text-xl font-bold text-emerald-600">{stats.totalCapacity.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Total Box Capacity</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-xl font-bold text-amber-600">{stats.avgCapacity}</div>
          <div className="text-[10px] text-slate-500">Avg Capacity</div>
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
              placeholder="Search part number, model, prefix..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 max-w-xs">
            <label className="text-[10px] font-medium text-slate-500 uppercase mb-1 block">Prefix</label>
            <select
              value={filterPrefix}
              onChange={(e) => setFilterPrefix(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Prefixes</option>
              {prefixes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <button onClick={toggleSelectAll} className="text-xs text-blue-600 hover:underline">
            {selectedIds.size === filteredProducts.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        loading={loading}
        error={error}
        pageSize={10}
        onRowClick={handleView}
        emptyMessage="No products found"
      />

      {/* View Modal */}
      <ViewModal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, data: null })}
        title="Product Details"
        data={viewModal.data}
        fields={viewFields}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, data: null })}
        onSubmit={handleSubmit}
        title={formModal.data ? 'Edit Product' : 'Create Product'}
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
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.data?.part_number}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default Products;
