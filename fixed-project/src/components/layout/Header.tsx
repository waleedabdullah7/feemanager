import { Bell, Settings, Moon, Sun, Wifi, WifiOff, LogOut, User as UserIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getTheme, setTheme, getCurrentUser, logout, getStudents, getSalaryPayments, getTeachers } from '@/store';
import { cn } from '@/utils/cn';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Header({ title, subtitle, onNavigate, onLogout }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTheme, setCurrentTheme] = useState(getTheme());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const currentUser = getCurrentUser();
  const students = getStudents();
  const teachers = getTeachers();
  const salaryPayments = getSalaryPayments();

  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // Logic for dynamic notifications
  const getNotifications = () => {
    const alerts = [];
    
    // Check for fee defaulters
    const activeStudents = students.filter(s => s.status === 'active');
    if (activeStudents.length > 0) {
      alerts.push({
        id: 'fees',
        title: 'Fee Status',
        message: `Currently tracking ${activeStudents.length} active student accounts.`,
        type: 'info',
        time: 'Real-time'
      });
    }

    // Check for salary updates
    const unpaidTeachers = teachers.filter(t => t.status === 'active').length;
    if (unpaidTeachers > 0) {
      alerts.push({
        id: 'salary',
        title: 'Payroll Alert',
        message: `${unpaidTeachers} staff members are active in the system.`,
        type: 'warning',
        time: 'Today'
      });
    }

    // System health
    alerts.push({
      id: 'system',
      title: 'System Stable',
      message: 'Local database is optimized and running smoothly.',
      type: 'success',
      time: 'Just now'
    });

    return alerts;
  };

  const notifications = getNotifications();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-400 hidden xl:block">{currentDate}</span>
        
        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-1">
          {isOnline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
          title={currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {currentTheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all relative",
              showNotifications && "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
            )}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">System</span>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</p>
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t border-gray-100 dark:border-gray-700 uppercase tracking-widest">
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Settings */}
        <button 
          onClick={() => onNavigate('settings-school')}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1" />

        {/* User Profile */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200 dark:shadow-none">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-left hidden md:block pr-2">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{currentUser?.fullName || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight uppercase tracking-widest">{currentUser?.role || 'admin'}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Signed in as</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 truncate">{currentUser?.email || 'admin@school.com'}</p>
              </div>
              <div className="p-2">
                <button 
                  onClick={() => { onNavigate('settings-users'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>My Profile</span>
                </button>
                <button 
                  onClick={() => { onNavigate('settings-school'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
              <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
