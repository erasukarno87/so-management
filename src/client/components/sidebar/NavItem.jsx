// NavItem - Navigation item component for Sidebar
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Truck, BarChart3, Bell, Settings } from 'lucide-react';

const icons = {
  '/': LayoutDashboard,
  '/sales-orders': ShoppingCart,
  '/delivery': Truck,
  '/reports': BarChart3,
  '/alerts': Bell,
  '/admin': Settings,
};

export function NavItem({ item, variant = 'default', isExpanded }) {
  const Icon = icons[item.path] || LayoutDashboard;

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
          isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {isExpanded && <span className="font-semibold text-sm">{item.label}</span>}
    </NavLink>
  );
}