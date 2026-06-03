// SOItemsEditor - Sales order items editor component
import { Plus, X, Package, Hash } from 'lucide-react';

export function SOItemsEditor({ items, products, onAdd, onRemove, onUpdate }) {
  const totalQty = items.reduce((sum, i) => sum + (parseInt(i.qty_plan) || 0), 0);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-800">Product Items</label>
            <p className="text-xs text-slate-500">{items.length} item(s)</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wide">
        <div className="col-span-5">Item Number</div>
        <div className="col-span-4">Model Code</div>
        <div className="col-span-2 text-center">Qty Plan</div>
        <div className="col-span-1"></div>
      </div>

      {/* Items */}
      <div className="divide-y divide-slate-100">
        {items.map((item, index) => {
          const selectedProduct = products.find(p => p.part_number === item.item_number);
          return (
            <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50 transition-colors">
              <div className="col-span-5">
                {products.length === 0 ? (
                  <div className="flex items-center gap-2 text-amber-600 text-xs">
                    <Hash className="w-3 h-3" />
                    No products available
                  </div>
                ) : (
                  <select
                    value={item.item_number}
                    onChange={e => {
                      const newVal = e.target.value;
                      const prod = products.find(p => p.part_number === newVal);
                      onUpdate(index, 'item_number', newVal);
                      if (prod) onUpdate(index, 'model_code', prod.model_code || '');
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all bg-white"
                  >
                    <option value="">Select item...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.part_number}>{p.part_number}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  value={item.model_code || selectedProduct?.model_code || ''}
                  readOnly
                  placeholder="Auto-filled"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.qty_plan}
                  onChange={e => onUpdate(index, 'qty_plan', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={items.length === 1}
                  title={items.length === 1 ? 'At least one item required' : 'Remove item'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with Total */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
        <span className="text-xs text-slate-500">All items with quantity will be saved</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Total Quantity:</span>
          <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-sm">
            {totalQty.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SOItemsEditor;