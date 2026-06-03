// IconButton - Reusable icon button component

export function IconButton({ icon: Icon, label, size = 'md', variant = 'default', onClick, disabled = false, className = '' }) {
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  const variantClasses = {
    default: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
    primary: 'text-blue-600 hover:bg-blue-50',
    success: 'text-emerald-600 hover:bg-emerald-50',
    warning: 'text-amber-600 hover:bg-amber-50',
    danger: 'text-red-600 hover:bg-red-50',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        rounded-lg transition-colors
        ${sizeClasses[size]}
        ${variantClasses[variant] || variantClasses.default}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <Icon className={`${iconSizes[size]} ${disabled ? '' : ''}`} />
    </button>
  );
}

export function IconButtonGroup({ buttons, size = 'md' }) {
  return (
    <div className="flex gap-1">
      {buttons.map((btn, index) => (
        <IconButton key={index} {...btn} size={size} />
      ))}
    </div>
  );
}

export function ActionButton({ icon: Icon, label, variant = 'default', size = 'md', onClick, disabled = false }) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantClasses = {
    default: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    warning: 'bg-amber-600 text-white hover:bg-amber-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1.5 rounded-lg font-medium transition-colors
        ${sizeClasses[size]}
        ${variantClasses[variant] || variantClasses.default}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}

export default IconButton;