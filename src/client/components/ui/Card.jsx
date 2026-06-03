// Card - Reusable card component with consistent styling

export function Card({ children, className = '', padding = true, hover = false, onClick }) {
  const paddingClass = padding ? 'p-4' : '';
  const hoverClass = hover ? 'hover:shadow-md hover:border-blue-200 cursor-pointer transition-all' : '';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 ${paddingClass} ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

export function GlassCard({ children, className = '', padding = true }) {
  const paddingClass = padding ? 'p-4' : '';
  return (
    <div className={`glass-card rounded-2xl ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}

export default Card;