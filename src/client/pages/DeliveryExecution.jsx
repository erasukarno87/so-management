// Delivery Execution page - Professional version with inline filters
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Package, ScanBarcode, Check, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { DataTable, BadgeCell, DateCell } from '../components/DataTable';
import { parseGS1Barcode } from '../utils/barcode';

const toast = window.__TOAST__;

function DeliveryExecution() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [productMasters, setProductMasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersResponse, productsResponse] = await Promise.all([
        api.get('/sales-orders'),
        api.get('/products'),
      ]);
      setOrders(ordersResponse.data || []);
      const masters = (productsResponse.data || []).map(p => ({
        modelCode: p.model_code,
        prefix: p.prefix || '0000'
      }));
      setProductMasters(masters);
    } catch (err) {
      console.error('Failed to load delivery data:', err);
      setError(err.response?.data?.error?.message || 'Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtered data
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (!o.so_number?.toLowerCase().includes(s) &&
            !o.customer_name?.toLowerCase().includes(s) &&
            !o.delivery_destination?.toLowerCase().includes(s)) return false;
      }
      return o.status !== 'COMPLETED';
    });
  }, [orders, searchTerm]);

  const handleBarcodeSubmit = () => {
    if (!manualBarcode.trim()) {
      setScanError('Please enter a barcode');
      return;
    }
    const parsed = parseGS1Barcode(manualBarcode, productMasters);
    if (parsed) {
      setScannedData(parsed);
      setScanError(null);
      setManualBarcode('');
      toast?.success?.('Barcode parsed successfully');
    } else {
      setScanError('Invalid barcode format. Expected GS1-128 format: [)>06...');
      setScannedData(null);
      toast?.error?.('Invalid barcode format');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBarcodeSubmit();
  };

  const clearScan = () => {
    setScannedData(null);
    setScanError(null);
    setManualBarcode('');
    inputRef.current?.focus();
  };

  // Stats
  const stats = useMemo(() => ({
    total: filteredOrders.length,
    pending: filteredOrders.filter(d => d.status === 'PENDING').length,
    partial: filteredOrders.filter(d => d.status === 'PARTIAL').length,
    totalPlan: filteredOrders.reduce((s, d) => s + Number(d.total_qty_plan || 0), 0),
    totalDelivered: filteredOrders.reduce((s, d) => s + Number(d.total_qty_actual || 0), 0),
    totalRemaining: filteredOrders.reduce((s, d) => s + Number((d.total_qty_plan || 0) - (d.total_qty_actual || 0)), 0),
  }), [filteredOrders]);

  const totalRowConfig = {
    total_qty_plan: { aggregate: 'sum' },
    total_qty_actual: { aggregate: 'sum' },
    remaining: { aggregate: 'sum' },
  };

  // Table columns
  const columns = [
    {
      key: 'so_number',
      label: 'SO Number',
      sortable: true,
      render: (val) => <span className="font-mono font-semibold text-blue-600">{val}</span>,
    },
    {
      key: 'customer_name',
      label: 'Customer',
      sortable: true,
      render: (val) => <span className="text-slate-600">{val}</span>,
    },
    {
      key: 'delivery_destination',
      label: 'Destination',
      sortable: true,
      render: (val) => <span className="text-slate-600">{val || '-'}</span>,
    },
    {
      key: 'delivery_date',
      label: 'Date',
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString('en-GB') : '-',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (val) => {
        const colors = { PENDING: 'bg-red-100 text-red-700', PARTIAL: 'bg-amber-100 text-amber-700', COMPLETED: 'bg-emerald-100 text-emerald-700' };
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[val] || 'bg-slate-100'}`}>{val}</span>;
      },
    },
    {
      key: 'total_qty_plan',
      label: 'Plan',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-semibold">{Number(val || 0).toLocaleString()}</span>,
    },
    {
      key: 'total_qty_actual',
      label: 'Delivered',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-semibold text-emerald-600">{Number(val || 0).toLocaleString()}</span>,
    },
    {
      key: 'remaining',
      label: 'Remaining',
      sortable: true,
      align: 'right',
      render: (val, row) => {
        const rem = (row.total_qty_plan || 0) - (row.total_qty_actual || 0);
        return <span className={`font-semibold ${rem > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{Number(rem).toLocaleString()}</span>;
      },
    },
  ];

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Delivery Execution</h1>
          <p className="text-xs text-slate-500 mt-0.5">{filteredOrders.length} active orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowScanner(!showScanner)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showScanner ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ScanBarcode className="w-3.5 h-3.5" />
            {showScanner ? 'Hide Scanner' : 'Scan Barcode'}
          </button>
        </div>
      </div>

      {/* Barcode Scanner */}
      {showScanner && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <ScanBarcode className="w-4 h-4 text-blue-600" />
            GS1-128 Barcode Scanner
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={manualBarcode}
              onChange={(e) => { setManualBarcode(e.target.value); setScanError(null); setScannedData(null); }}
              onKeyDown={handleKeyDown}
              placeholder="Scan or enter GS1-128 barcode..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
              autoFocus
            />
            <button onClick={handleBarcodeSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
              Parse
            </button>
            {scannedData && (
              <button onClick={clearScan} className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs hover:bg-slate-300">
                Clear
              </button>
            )}
          </div>

          {scanError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Scan Error</p>
                <p className="text-xs text-red-600">{scanError}</p>
              </div>
            </div>
          )}

          {scannedData && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-emerald-800 text-sm mb-2">Barcode Parsed Successfully</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {[
                      { label: 'Part Number', value: scannedData.partNumber },
                      { label: 'Vendor Code', value: scannedData.vendorCode || '-' },
                      { label: 'Location', value: scannedData.location },
                      { label: 'Quantity', value: scannedData.quantity, bold: true },
                      { label: 'Model Code', value: scannedData.modelCode },
                      { label: 'Order Number', value: scannedData.orderNumber },
                      { label: 'Prefix', value: scannedData.prefix },
                    ].map((item, i) => (
                      <div key={i}>
                        <p className="text-[10px] text-emerald-600 uppercase tracking-wide">{item.label}</p>
                        <p className={`font-mono font-medium text-slate-800 ${item.bold ? 'text-base' : ''}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 p-2 bg-slate-100 rounded-lg text-[10px] text-slate-600">
            <strong>Format:</strong> [)&gt;06 + 6 chars + 14 chars part + V + vendor + 3L + location + K + order + Q + qty
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
          <div className="text-lg font-bold text-blue-600">{stats.total}</div>
          <div className="text-[10px] text-slate-500">Active Orders</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
          <div className="text-lg font-bold text-red-600">{stats.pending}</div>
          <div className="text-[10px] text-slate-500">Pending</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <div className="text-lg font-bold text-amber-600">{stats.partial}</div>
          <div className="text-[10px] text-slate-500">In Progress</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <div className="text-lg font-bold text-slate-700">{stats.totalPlan.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Total Plan</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          <div className="text-lg font-bold text-emerald-600">{stats.totalDelivered.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Delivered</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <div className="text-lg font-bold text-amber-600">{stats.totalRemaining.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Remaining</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SO number, customer, destination..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="mt-2 text-xs text-red-500 hover:underline">
            Clear search
          </button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        loading={loading}
        error={error}
        pageSize={10}
        emptyMessage="No delivery orders found"
      />
    </div>
  );
}

export default DeliveryExecution;
