// ViewModal - Display record details in a modal
import { X, Eye } from 'lucide-react';

export function ViewModal({ isOpen, onClose, title, data, fields = [] }) {
  if (!isOpen || !data) return null;

  const renderValue = (field, value) => {
    if (field.render) return field.render(value, data);
    if (value === null || value === undefined || value === '') return <span className="text-slate-400">-</span>;
    if (field.type === 'date') return new Date(value).toLocaleDateString('en-GB');
    if (field.type === 'number') return Number(value).toLocaleString();
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <p className="text-xs text-slate-500">View details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className={field.fullWidth ? 'col-span-2' : ''}>
                <label className="text-xs font-medium text-slate-500 uppercase">{field.label}</label>
                <div className="mt-1 text-sm font-medium text-slate-800">
                  {renderValue(field, data[field.key])}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;