// Layout component
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../store/authStore';

const SIDEBAR_EXPANDED_WIDTH = 220; // w-56 = 14rem = 224px
const SIDEBAR_COLLAPSED_WIDTH = 64;  // w-16 = 4rem = 64px
const MOBILE_BREAKPOINT = 1024; // lg breakpoint

function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [activeAdminTab, setActiveAdminTab] = useState('users');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname.startsWith('/users')) {
      setActiveAdminTab('users');
    } else if (location.pathname.startsWith('/customers')) {
      setActiveAdminTab('customers');
    } else if (location.pathname.startsWith('/products')) {
      setActiveAdminTab('products');
    }
  }, [location.pathname]);

  useEffect(() => {
    window.updateAdminTab = setActiveAdminTab;
    return () => { delete window.updateAdminTab; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <Header user={user} onLogout={logout} activeAdminTab={activeAdminTab} />
        <main className="p-4 min-h-[calc(100vh-56px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;