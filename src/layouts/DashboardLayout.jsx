import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  LogOut,
  Menu,
  X,
  CircleDollarSign,
  UserPlus,
  Calendar,
  Contact,
  CalendarClock,
  Monitor,
  Settings
} from 'lucide-react';
import { cn } from '../utils/cn';
import axios from '../api/axios';
import NotificationDropdown from '../components/NotificationDropdown';
import UserDropdown from '../components/UserDropdown';
import AttendancePunch from '../components/AttendancePunch';
import { hasPermission } from '../utils/permissionUtils';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    const syncPermissions = async () => {
      try {
        const response = await axios.get('/v1/users/me/permissions');
        const { pages, modules, role_name } = response.data.data;
        
        // Update local user state with new permissions format
        const updatedUser = { ...user, pages, modules, role_name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } catch (err) {
        console.error('Failed to sync permissions:', err);
      }
    };
    syncPermissions();
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    { label: 'Users', path: '/users', icon: Users, permission: 'users' },
    { label: 'Clients', path: '/clients', icon: Contact, permission: 'clients' },
    { label: 'Projects', path: '/projects', icon: FolderKanban, permission: 'projects' },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare, permission: 'tasks' },
    { label: 'Finance', path: '/finance', icon: CircleDollarSign, permission: 'finance' },
    { label: 'HR', path: '/hr', icon: UserPlus, permission: 'hr' },
    { label: 'Attendance', path: '/attendance', icon: CalendarClock, permission: 'attendance' },
    { label: 'My Time Off', path: '/leaves', icon: Calendar },
    { label: 'Resources', path: '/resources', icon: CalendarClock, permission: 'resources' },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:block",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
             <img src="/invertio logo.png" alt="Invertio Logo" className="h-10 w-auto object-contain" />
          </div>
          <button 
            className="lg:hidden p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                isActive 
                  ? "bg-primary-50 text-primary-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 mr-3 flex-shrink-0 transition-colors",
              )} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-slate-100">
          <AttendancePunch />
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-30">
          <button 
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex justify-end items-center gap-4">
            <NotificationDropdown />
            <UserDropdown user={user} onLogout={handleLogout} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
