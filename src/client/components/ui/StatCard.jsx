// StatCard - Reusable statistics card component

export function StatCard({ value, label, color = 'slate', icon: Icon = null, trend = null, onClick }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
  };

  const iconBgColors = {
    blue: 'bg-blue-100',
    red: 'bg-red-100',
    amber: 'bg-amber-100',
    emerald: 'bg-emerald-100',
    slate: 'bg-slate-100',
    purple: 'bg-purple-100',
  };

  return (
    <div
      className={`rounded-lg p-2.5 border ${colors[color] || colors.slate} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-bold">{value}</div>
          <div className="text-[10px] opacity-70">{label}</div>
        </div>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgColors[color] || iconBgColors.slate}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      {trend !== null && (
        <div className={`mt-1 text-[10px] ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}% from last period
        </div>
      )}
    </div>
  );
}

export function StatCardGrid({ stats, columns = 6 }) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div className={`grid ${gridCols[columns] || gridCols[6]} gap-2`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

export function StatCardLarge({ value, label, color = 'slate', icon: Icon = null, gradient = false, className = '' }) {
  const baseClasses = `rounded-xl p-4 transition-all hover:shadow-md ${gradient ? 'gradient-primary text-white' : 'bg-white border border-slate-200'}`;
  const iconBgClass = gradient ? 'bg-white/20' : 'bg-slate-100';
  const textColorClass = gradient ? 'text-white' : color === 'slate' ? 'text-slate-800' : color;

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${iconBgClass}`}>
        {Icon && <Icon className={`w-4 h-4 ${gradient ? 'text-white' : 'text-slate-600'}`} />}
      </div>
      <p className={`text-xl font-bold ${textColorClass}`}>{value}</p>
      <p className={`text-xs mt-0.5 ${gradient ? 'text-white/70' : 'text-slate-500'}`}>{label}</p>
    </div>
  );
}

export default StatCard;