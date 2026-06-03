// ConfirmModal - Generic confirmation dialog
import { AlertCircle, Loader2 } from 'lucide-react';

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    default: 'bg-slate-600 hover:bg-slate-700',
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    success: 'bg-emerald-600 hover:bg-emerald-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            variant === 'danger' ? 'bg-red-100' :
            variant === 'warning' ? 'bg-amber-100' :
            variant === 'success' ? 'bg-emerald-100' : 'bg-blue-100'
          }`}>
            <AlertCircle className={`w-8 h-8 ${
              variant === 'danger' ? 'text-red-600' :
              variant === 'warning' ? 'text-amber-600' :
              variant === 'success' ? 'text-emerald-600' : 'text-blue-600'
            }`} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${variantStyles[variant] || variantStyles.default}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;