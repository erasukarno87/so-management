// ProductsTab - Product master data management
import { useState, useEffect, useMemo } from 'react';
import { Package, Search, Boxes, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/client';
import { DataTable } from '../../components/DataTable';
import { useToast } from '../../hooks';

export function ProductsTab({ onEdit, onDelete }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load products
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => { loadProducts(); }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p =>
      p.part_number?.toLowerCase().includes(term) ||
      p.model_code?.toLowerCase().includes(term) ||
      p.prefix?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const stats = useMemo(() => ({
    total: filteredProducts.length,
    totalCapacity: filteredProducts.reduce((sum, p) => sum + (p.box_capacity || 0), 0),
  }), [filteredProducts]);

  const columns = [
    {
      key: 'part_number', label: 'Part Number', sortable: true,
      render: v => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-mono font-semibold text-blue-700">{v}</span>
        </div>
      ),
    },
    {
      key: 'model_code', label: 'Model', sortable: true, align: 'center',
      render: v => (
        <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">{v}</span>
      ),
    },
    {
      key: 'prefix', label: 'Prefix', sortable: true, align: 'center',
      render: v => (
        <span className="font-mono font-bold text-emerald-700">{v}</span>
      ),
    },
    {
      key: 'box_capacity', label: 'Capacity', sortable: true, align: 'center',
      render: v => (
        <div className="flex items-center justify-center gap-1">
          <Boxes className="w-4 h-4 text-amber-500" />
          <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold text-sm">{v}</span>
        </div>
      ),
    },
    {
      key: 'description', label: 'Description',
      render: v => (
        <span className="text-sm text-slate-600 truncate max-w-xs" title={v}>
          {v || <span className="text-slate-400 italic">No description</span>}
        </span>
      ),
    },
    {
      key: 'actions', label: '', width: 'w-24', align: 'right',
      render: (_, product) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(product)}
            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
            title="Edit product"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Stats */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl">
            <Package className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">{stats.total} product(s)</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <Boxes className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">{stats.totalCapacity.toLocaleString()} units</span>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        loading={loading}
        error={error}
        pageSize={10}
        emptyMessage="No products found"
      />
    </div>
  );
}

export default ProductsTab;