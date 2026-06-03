// Header component for SO-Management
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, ChevronRight } from 'lucide-react';

const ROUTE_LABELS = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/sales-orders': 'Sales Orders',
  '/delivery': 'Delivery Execution',
  '/admin': 'Admin',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
};

// Admin tab labels
const ADMIN_TAB_LABELS = {
  users: 'User',
  customers: 'Customer',
  products: 'Produk',
};

function Header({ user, onLogout, activeAdminTab, adminPageTitle }) {
  const { logout } = useAuthStore();
  const location = useLocation();
  const handleLogout = onLogout || logout;

  // Check if current route is admin
  const isAdminRoute = location.pathname === '/admin' || location.pathname === '/users';

  // Get current page name from route
  const getPageName = () => {
    if (isAdminRoute && (activeAdminTab || adminPageTitle)) {
      const tabLabel = adminPageTitle || ADMIN_TAB_LABELS[activeAdminTab] || 'Admin';
      return `Admin > ${tabLabel}`;
    }
    const path = location.pathname;
    return ROUTE_LABELS[path] || ROUTE_LABELS[path.replace(/\/[^/]+$/, '')] || 'Page';
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-800">{getPageName()}</span>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User dropdown */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-slate-800">
                  {user?.name || user?.username || 'User'}
                </div>
                <div className="text-xs text-slate-500">
                  {user?.role ? user.role.toUpperCase() : 'Unknown'}
                </div>
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center font-medium">
                {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;