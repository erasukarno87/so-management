// Input - Reusable input components

export function Input({ label, error, helper, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-300'}
        `}
        {...props}
      />
      {helper && !error && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, helper, options = [], placeholder = 'Select...', className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-300'}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.sublabel ? `${opt.label} (${opt.sublabel})` : opt.label}
          </option>
        ))}
      </select>
      {helper && !error && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, helper, rows = 3, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-3 py-2 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-300'}
        `}
        {...props}
      />
      {helper && !error && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Checkbox({ label, error, className = '', ...props }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      {label && <label className="text-sm text-slate-700">{label}</label>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export default Input;