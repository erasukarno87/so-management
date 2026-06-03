// SOFormContent - Custom form content for sales order form
import { SOItemsEditor } from './SOItemsEditor';
import { DELIVERY_TYPE_OPTIONS } from '../../utils/constants';
import { User, MapPin, Truck, Calendar, FileText, Layers } from 'lucide-react';

export function SOFormContent({
  formData,
  setFormData,
  soItems,
  setSoItems,
  products,
  filteredCustomers,
  filteredDestinations,
  selectedDeliveryType,
  selectedCustomerId,
  selectedDestinationId,
  onDeliveryTypeChange,
  onCustomerSelect,
  onDestinationSelect,
}) {
  const addItemRow = () => setSoItems([...soItems, { item_number: '', model_code: '', qty_plan: '' }]);
  const removeItemRow = (index) => soItems.length > 1 && setSoItems(soItems.filter((_, i) => i !== index));
  const updateItemRow = (index, field, value) => {
    setSoItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  // Get selected destination info
  const selectedDest = filteredDestinations.find(d => d.code === formData.destination_id);

  return (
    <div className="space-y-5">
      {/* Section: Order Info */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
            <Layers className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Order Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Customer PO Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.so_number || ''}
              onChange={e => setFormData({ ...formData, so_number: e.target.value })}
              placeholder="#XXXXX"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all bg-white"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Delivery Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.delivery_date || ''}
              onChange={e => setFormData({ ...formData, delivery_date: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all bg-white"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
            <span className="w-3.5 h-3.5 flex items-center justify-center text-slate-400 font-mono text-[10px]">#</span>
            Bucket No
          </label>
          <input
            type="text"
            value={formData.bucket_no || ''}
            onChange={e => setFormData({ ...formData, bucket_no: e.target.value })}
            placeholder="Auto-generated from date"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all bg-white"
          />
        </div>
      </div>

      {/* Section: Customer & Destination */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Customer & Destination</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.customer_id || selectedCustomerId || ''}
              onChange={e => { setFormData({ ...formData, customer_id: e.target.value }); onCustomerSelect(e.target.value); }}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all bg-white"
            >
              <option value="">Select customer...</option>
              {filteredCustomers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              Delivery Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.delivery_type || selectedDeliveryType || ''}
              onChange={e => { setFormData({ ...formData, delivery_type: e.target.value }); onDeliveryTypeChange(e.target.value); }}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all bg-white"
            >
              <option value="">Select type...</option>
              {DELIVERY_TYPE_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Destination
          </label>
          <select
            value={formData.destination_id || selectedDestinationId || ''}
            onChange={e => { setFormData({ ...formData, destination_id: e.target.value }); onDestinationSelect(e.target.value); }}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all bg-white"
          >
            <option value="">Select destination...</option>
            {filteredDestinations.map(d => (
              <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
            ))}
          </select>
          {selectedDest && (
            <p className="mt-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Selected: {selectedDest.name} ({selectedDest.delivery_types?.join(', ')})
            </p>
          )}
        </div>
      </div>

      {/* Section: Product Items */}
      <SOItemsEditor items={soItems} products={products} onAdd={addItemRow} onRemove={removeItemRow} onUpdate={updateItemRow} />

      {/* Section: Remark */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Remark / Notes
        </label>
        <textarea
          value={formData.remark || ''}
          onChange={e => setFormData({ ...formData, remark: e.target.value })}
          placeholder="Additional notes or special instructions..."
          rows={2}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all bg-white"
        />
      </div>
    </div>
  );
}

export default SOFormContent;