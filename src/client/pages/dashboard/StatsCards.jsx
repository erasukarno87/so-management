// StatsCards - Dashboard stats cards component
import { Package, Activity, CheckCircle, Factory, CalendarClock, AlertTriangle } from 'lucide-react';
import { StatCardLarge } from '../../components/ui';

export function StatsCards({ stats, unreadAlerts }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      <StatCardLarge icon={Package} value={stats.total} label="Total SO" gradient />
      <StatCardLarge icon={Activity} value={`${stats.completionRate}%`} label="Completion" />
      <StatCardLarge icon={CheckCircle} value={stats.totalActual.toLocaleString()} label="Delivered" color="emerald" />
      <StatCardLarge icon={Factory} value={stats.remaining.toLocaleString()} label="Remaining" />
      <StatCardLarge icon={CalendarClock} value={stats.due3Days} label="Due ≤ 3 Hari" color="amber" />
      <StatCardLarge icon={AlertTriangle} value={unreadAlerts} label="Unread Alerts" color="red" />
    </div>
  );
}

export default StatsCards;