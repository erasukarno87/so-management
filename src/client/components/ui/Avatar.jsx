// Avatar - Reusable avatar component

export function Avatar({ name, src, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div className={`rounded-full bg-slate-700 text-white flex items-center justify-center font-bold ${sizeClasses[size]} ${className}`}>
      {getInitials(name)}
    </div>
  );
}

export function AvatarGroup({ avatars, max = 4, size = 'md' }) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {displayAvatars.map((avatar, index) => (
        <Avatar key={index} {...avatar} size={size} className="ring-2 ring-white" />
      ))}
      {remaining > 0 && (
        <div className={`rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-medium ring-2 ring-white ${sizeClasses[size]}`}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

const sizeClasses = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
};

export default Avatar;