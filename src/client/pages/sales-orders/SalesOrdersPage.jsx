// SalesOrdersPage - Main sales orders page
import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { Plus, Trash2, Eye, Edit2, CheckSquare, Square, RefreshCw, Filter, Package, X } from 'lucide-react';
import api from '../../api/client';
import { DataTable } from '../../components/DataTable';
import { ViewModal, FormModal, DeleteModal } from '../../components/Modal';
import { useToast, useStats, useFilters } from '../../hooks';
import { STATUS_OPTIONS, DELIVERY_TYPE_OPTIONS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { StatCard } from '../../components/ui';
import { SOItemsEditor } from './SOItemsEditor';
import { SOFormContent } from './SOFormContent';

function SalesOrdersPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const {
    filters,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useFilters({ initialFilters: { status: '', customer: '', type: '' } });

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [viewModal, setViewModal] = useState({ open: false, data: null });
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SO Items state for form
  const [soItems, setSoItems] = useState([{ item_number: '', model_code: '', qty_plan: '' }]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [soFormData, setSoFormData] = useState({}); // Centralized form data for SO

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [soRes, custRes, destRes, prodRes] = await Promise.all([
        api.get('/sales-orders'),
        api.get('/customers'),
        api.get('/destinations'),
        api.get('/products'),
      ]);
      setOrders(soRes.data || []);
      setCustomers(custRes.data || []);
      setDestinations(destRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Load failed');
      toastRef.current.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredCustomers = useMemo(() =>
    selectedDeliveryType ? customers.filter(c => c.delivery_type_name === selectedDeliveryType) : customers,
    [customers, selectedDeliveryType]
  );

  const filteredDestinations = useMemo(() => {
    // Show all destinations when no customer is selected (for edit mode)
    if (!selectedCustomerId) {
      return destinations;
    }
    let dests = destinations.filter(d => d.customer_id === selectedCustomerId);
    if (selectedDeliveryType) {
      dests = dests.filter(d => {
        const types = d.delivery_types ? JSON.parse(d.delivery_types) : [];
        return types.includes(selectedDeliveryType);
      });
    }
    return dests;
  }, [selectedCustomerId, destinations, selectedDeliveryType]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (searchTerm && !o.so_number?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !o.delivery_destination?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filters.status && o.status !== filters.status) return false;
      if (filters.customer && o.customer_id !== filters.customer) return false;
      if (filters.type && o.delivery_type !== filters.type) return false;
      return true;
    });
  }, [orders, searchTerm, filters]);

  const stats = useStats(filteredOrders, {
    statusField: 'status',
    sumFields: ['total_qty_plan', 'total_qty_actual'],
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.size === filteredOrders.length ? new Set() : new Set(filteredOrders.map(o => o.id)));
  };

  const handleView = (order) => setViewModal({ open: true, data: order });

  const handleCreate = () => {
    setSelectedDeliveryType('');
    setSelectedCustomerId('');
    setSelectedDestinationId('');
    setSoItems([{ item_number: '', model_code: '', qty_plan: '' }]);
    // Initialize with default delivery_date
    const today = new Date().toISOString().split('T')[0];
    setSoFormData({ delivery_date: today });
    setFormModal({ open: true, data: null });
  };

  const handleEdit = async (order) => {
    try {
      const encodedId = encodeURIComponent(order.id);
      const res = await api.get(`/sales-orders/${encodedId}`);
      const fullOrder = res.data;
      setSelectedDeliveryType(fullOrder.delivery_type || '');
      setSelectedCustomerId(fullOrder.customer_id || '');
      setSelectedDestinationId(fullOrder.destination_id || '');
      if (fullOrder.items?.length > 0) {
        setSoItems(fullOrder.items.map(item => ({
          item_number: item.item_number || '',
          model_code: item.model_code || '',
          qty_plan: item.qty_plan || ''
        })));
      } else {
        setSoItems([{ item_number: fullOrder.primary_item_number || '', model_code: '', qty_plan: fullOrder.total_qty_plan || '' }]);
      }
      setSoFormData({
        so_number: fullOrder.so_number || '',
        bucket_no: fullOrder.bucket_no || '',
        delivery_type: fullOrder.delivery_type || '',
        customer_id: fullOrder.customer_id || '',
        destination_id: fullOrder.destination_id || '',
        delivery_destination: fullOrder.delivery_destination || '',
        delivery_date: fullOrder.delivery_date ? fullOrder.delivery_date.split('T')[0] : '',
        remark: fullOrder.remark || '',
        id: fullOrder.id,
      });
      setFormModal({ open: true, data: fullOrder });
    } catch (err) {
      toastRef.current.error('Failed to load order details');
    }
  };

  const handleDelete = (order) => setDeleteModal({ open: true, data: order });

  const handleDeliveryTypeChange = (type) => {
    setSelectedDeliveryType(type);
    setSelectedCustomerId('');
  };

  const handleCustomerSelect = (customerId) => setSelectedCustomerId(customerId);
  const handleDestinationSelect = (destinationId) => setSelectedDestinationId(destinationId);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const mergedFormData = { ...soFormData, ...formData };
      const selectedCustomer = filteredCustomers.find(c => c.id === mergedFormData.customer_id);
      const selectedDest = filteredDestinations.find(d => d.code === mergedFormData.destination_id);
      const itemsWithData = soItems.filter(item => item.item_number);
      const totalQty = soItems.reduce((sum, item) => sum + (parseInt(item.qty_plan) || 0), 0);

      const customerName = selectedCustomer?.name || mergedFormData.customer_name || '';
      if (!customerName) {
        toastRef.current.error('Please select a customer');
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        ...mergedFormData,
        customer_name: customerName,
        destination_id: mergedFormData.destination_id || null,
        destination_name: selectedDest?.name || mergedFormData.destination_name || '',
        delivery_destination: mergedFormData.delivery_destination || selectedDest?.name || '',
        total_qty_plan: totalQty,
        primary_item_number: soItems[0]?.item_number || '',
        items: itemsWithData.map(item => ({
          item_number: item.item_number,
          model_code: item.model_code,
          qty_plan: parseInt(item.qty_plan) || 0
        })),
      };

      const isEdit = !!mergedFormData.id;
      if (isEdit) {
        await api.patch(`/sales-orders/${encodeURIComponent(mergedFormData.id)}`, submitData);
        toastRef.current.success('Sales order updated successfully');
      } else {
        await api.post('/sales-orders', submitData);
        toastRef.current.success('Sales order created successfully');
      }
      setFormModal({ open: false, data: null });
      setSelectedDeliveryType('');
      setSelectedCustomerId('');
      setSelectedDestinationId('');
      setSoItems([{ item_number: '', model_code: '', qty_plan: '' }]);
      loadData();
    } catch (err) {
      toastRef.current.error(err.response?.data?.error?.message || 'Failed to save');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/sales-orders/${encodeURIComponent(deleteModal.data.id)}`);
      toastRef.current.success('Sales order deleted successfully');
      setDeleteModal({ open: false, data: null });
      loadData();
    } catch (err) {
      toastRef.current.error('Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const headers = ['SO Number', 'Customer', 'Date', 'Destination', 'Type', 'Status', 'Plan', 'Actual'];
    const rows = filteredOrders.map(o => [o.so_number, o.customer_name, o.delivery_date, o.delivery_destination, o.delivery_type, o.status, o.total_qty_plan, o.total_qty_actual]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toastRef.current.success(`Exported ${filteredOrders.length} orders`);
  };

  const columns = [
    {
      key: 'checkbox', label: '', width: 'w-10',
      render: (_, order) => (
        <button onClick={() => toggleSelect(order.id)} className="p-1 rounded hover:bg-slate-100">
          {selectedIds.has(order.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-slate-300" />}
        </button>
      ),
    },
    { key: 'so_number', label: 'SO Number', sortable: true, render: v => <span className="font-mono font-semibold text-blue-600">{v}</span> },
    { key: 'customer_name', label: 'Customer', sortable: true },
    { key: 'delivery_date', label: 'Date', sortable: true, render: v => formatDate(v) },
    { key: 'delivery_destination', label: 'Destination', sortable: true },
    { key: 'delivery_type', label: 'Type', sortable: true, align: 'center' },
    {
      key: 'status', label: 'Status', sortable: true, align: 'center',
      render: (val) => {
        const opt = STATUS_OPTIONS.find(o => o.value === val);
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${opt?.color || 'bg-slate-100'}`}>{val}</span>;
      },
    },
    { key: 'total_qty_plan', label: 'Plan', sortable: true, align: 'right', render: v => Number(v || 0).toLocaleString() },
    { key: 'total_qty_actual', label: 'Actual', sortable: true, align: 'right', render: v => <span className="text-emerald-600">{Number(v || 0).toLocaleString()}</span> },
    {
      key: 'actions', label: 'Actions', width: 'w-24', align: 'right', sortable: false,
      render: (_, order) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => handleView(order)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600" title="View"><Eye className="w-4 h-4" /></button>
          <button onClick={() => handleEdit(order)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(order)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  const viewFields = [
    { key: 'so_number', label: 'SO Number' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'destination_id', label: 'Destination ID' },
    { key: 'destination_name', label: 'Destination Name' },
    { key: 'delivery_date', label: 'Delivery Date', type: 'date' },
    { key: 'delivery_destination', label: 'Delivery Address' },
    { key: 'delivery_type', label: 'Delivery Type' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'total_qty_plan', label: 'Plan Qty', type: 'number' },
    { key: 'total_qty_actual', label: 'Actual Qty', type: 'number' },
    { key: 'bucket_no', label: 'Bucket No' },
    { key: 'remark', label: 'Remark', fullWidth: true },
  ];

  const getFormFields = () => {
    const customerOptions = filteredCustomers.map(c => ({ value: c.id, label: c.name }));
    const destOptions = filteredDestinations.map(d => ({ value: d.id, label: `${d.code} - ${d.name}` }));
    return [
      { key: 'so_number', label: 'SO Number', required: true, placeholder: 'Format: #XXXXX' },
      { key: 'delivery_type', label: 'Delivery Type', type: 'select', options: DELIVERY_TYPE_OPTIONS, required: true, placeholder: 'Select delivery type', onChange: handleDeliveryTypeChange },
      { key: 'customer_id', label: 'Customer', type: 'select', options: customerOptions, required: true, placeholder: 'Select customer', onChange: handleCustomerSelect, helper: !selectedDeliveryType ? 'Select delivery type first' : customerOptions.length === 0 ? 'No customers for this type' : '' },
      { key: 'destination_id', label: 'Destination', type: 'select', options: destOptions, placeholder: 'Select destination or enter manually', helper: !selectedCustomerId ? 'Select customer first' : destOptions.length === 0 ? 'No destinations for this customer/type' : '' },
      { key: 'delivery_destination', label: 'Or Enter Address Manually', placeholder: 'Enter delivery address' },
      { key: 'delivery_date', label: 'Delivery Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
      { key: 'remark', label: 'Remark', type: 'textarea', placeholder: 'Optional notes...', fullWidth: true },
    ];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Sales Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">{filteredOrders.length} orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">Export</button>
          <button onClick={handleCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
            <Plus className="w-3.5 h-3.5" /> New SO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
        <StatCard value={stats.total} label="Total" color="blue" />
        <StatCard value={stats.pending} label="Pending" color="red" />
        <StatCard value={stats.partial} label="In Progress" color="amber" />
        <StatCard value={stats.completed} label="Completed" color="emerald" />
        <StatCard value={stats.totalPlan.toLocaleString()} label="Plan Qty" color="slate" />
        <StatCard value={stats.totalActual.toLocaleString()} label="Actual Qty" color="emerald" />
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        customers={customers}
      />

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <button onClick={toggleSelectAll} className="text-xs text-blue-600 hover:underline">
            {selectedIds.size === filteredOrders.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      )}

      <DataTable columns={columns} data={filteredOrders} loading={loading} error={error} pageSize={10} onRowClick={handleView} emptyMessage="No sales orders found" />

      <ViewModal isOpen={viewModal.open} onClose={() => setViewModal({ open: false, data: null })} title="Sales Order Details" data={viewModal.data} fields={viewFields} />

      <FormModal
        isOpen={formModal.open}
        onClose={() => { setFormModal({ open: false, data: null }); setSelectedDeliveryType(''); setSelectedCustomerId(''); setSelectedDestinationId(''); setSoItems([{ item_number: '', model_code: '', qty_plan: '' }]); setSoFormData({}); }}
        onSubmit={(data) => handleSubmit(data)}
        title={formModal.data ? 'Edit Sales Order' : 'Create Sales Order'}
        fields={getFormFields()}
        initialData={formModal.data}
        isLoading={isSubmitting}
        submitLabel={formModal.data ? 'Update' : 'Create'}
        customContent={(formData, setFormData) => (
          <SOFormContent
            formData={soFormData}
            setFormData={(data) => setSoFormData(prev => ({ ...prev, ...data }))}
            soItems={soItems}
            setSoItems={setSoItems}
            products={products}
            filteredCustomers={filteredCustomers}
            filteredDestinations={filteredDestinations}
            selectedDeliveryType={selectedDeliveryType}
            selectedCustomerId={selectedCustomerId}
            selectedDestinationId={selectedDestinationId}
            onDeliveryTypeChange={handleDeliveryTypeChange}
            onCustomerSelect={handleCustomerSelect}
            onDestinationSelect={handleDestinationSelect}
          />
        )}
      />

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, data: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Sales Order"
        message={`Are you sure you want to delete SO "${deleteModal.data?.so_number}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}

// Filter bar component - memoized to prevent re-renders
const FilterBar = memo(function FilterBar({ searchTerm, setSearchTerm, showFilters, setShowFilters, filters, updateFilter, clearFilters, hasActiveFilters, activeFilterCount, customers }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search SO number, customer, destination..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}>
          <Filter className="w-3.5 h-3.5" /> Filters
          {hasActiveFilters && !showFilters && <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
        </button>
        {hasActiveFilters && <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear</button>}
      </div>

      {showFilters && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase mb-1 block">Status</label>
            <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase mb-1 block">Customer</label>
            <select value={filters.customer} onChange={(e) => updateFilter('customer', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Customers</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase mb-1 block">Type</label>
            <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Types</option>
              {DELIVERY_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
});

export default SalesOrdersPage;