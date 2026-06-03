// LoadingSpinner - Reusable loading indicator component

export function LoadingSpinner({ size = 'md', color = 'blue', text = null }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    slate: 'border-slate-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    emerald: 'border-emerald-600 border-t-transparent',
    red: 'border-red-600 border-t-transparent',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color] || colorClasses.blue}`} />
      {text && <span className="text-slate-500 text-sm">{text}</span>}
    </div>
  );
}

export function LoadingOverlay({ text = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-600 font-medium">{text}</p>
      </div>
    </div>
  );
}

export function LoadingCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function LoadingTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-600 rounded animate-pulse w-24" />
          ))}
        </div>
      </div>
      {/* Body */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="px-4 py-4 flex gap-4">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div key={colIdx} className={`h-4 bg-slate-100 rounded animate-pulse ${rowIdx % 2 === 1 ? 'bg-slate-50' : ''}`} style={{ width: `${60 + colIdx * 20}px` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSpinner;