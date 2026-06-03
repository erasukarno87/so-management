// AlertStats - Stats cards for alerts page

export function AlertStats({ alerts }) {
  const total = alerts.length;
  const unread = alerts.filter(a => !a.is_read).length;
  const critical = alerts.filter(a => a.severity === 'critical').length;
  const warning = alerts.filter(a => a.severity === 'warning').length;
  const info = alerts.filter(a => a.severity === 'info').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatCard value={total} label="Total" color="slate" />
      <StatCard value={unread} label="Unread" color="blue" />
      <StatCard value={critical} label="Critical" color="red" />
      <StatCard value={warning} label="Warning" color="amber" />
      <StatCard value={info} label="Info" color="emerald" />
    </div>
  );
}

function StatCard({ value, label, color }) {
  const colors = {
    slate: 'bg-slate-50 border border-slate-200 text-slate-600',
    blue: 'bg-blue-50 border border-blue-200 text-blue-600',
    red: 'bg-red-50 border border-red-200 text-red-600',
    amber: 'bg-amber-50 border border-amber-200 text-amber-600',
    emerald: 'bg-emerald-50 border border-emerald-200 text-emerald-600',
  };

  return (
    <div className={`rounded-lg p-3 ${colors[color] || colors.slate}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] opacity-70">{label}</div>
    </div>
  );
}

export default AlertStats;