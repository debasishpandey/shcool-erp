import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, School, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SuperAdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/super-admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/super-admin', icon: LayoutDashboard },
    { name: 'Schools', path: '/super-admin/tenants', icon: School },
    { name: 'Settings', path: '/super-admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 h-16 shrink-0">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-semibold text-lg text-[var(--color-text-dark)]">School ERP</span>
        <div className="p-2 -mr-2 text-gray-500">
          <UserIcon className="h-6 w-6" />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar / Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none md:border-r md:border-gray-200 flex flex-col ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 shrink-0">
          <span className="font-bold text-xl text-[var(--color-primary)]">School ERP</span>
          <button 
            className="md:hidden p-2 -mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setDrawerOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-full">
            <UserIcon className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-dark)]">{user?.username}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              end={item.path === '/super-admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-md text-base font-medium text-[var(--color-danger)] hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
