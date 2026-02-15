import { cn } from '@/utils/cn';
import { 
  LayoutDashboard, Users, Wallet, FileText, BarChart3, 
  Settings, LogOut, ChevronDown, ChevronRight, GraduationCap,
  UserCog
} from 'lucide-react';
import { useState } from 'react';
import { getSchoolInfo, getCurrentUser, logout } from '@/store';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: { id: string; label: string }[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', 
    label: 'Students', 
    icon: Users,
    children: [
      { id: 'students-list', label: 'All Students' },
      { id: 'students-add', label: 'Add New' },
      { id: 'students-promotion', label: 'Promote Students' },
    ]
  },
  { 
    id: 'teachers', 
    label: 'Teachers & Salary', 
    icon: UserCog,
    children: [
      { id: 'teachers-list', label: 'All Teachers' },
      { id: 'teachers-add', label: 'Add Teacher' },
      { id: 'salary-pay', label: 'Pay Salary' },
      { id: 'salary-history', label: 'Salary History' },
    ]
  },
  { 
    id: 'fees', 
    label: 'Fee Collection', 
    icon: Wallet,
    children: [
      { id: 'fees-collect', label: 'Collect Fee' },
      { id: 'fees-pending', label: 'Pending Fees' },
      { id: 'fees-history', label: 'Fee History' },
    ]
  },
  { 
    id: 'invoices', 
    label: 'Invoices', 
    icon: FileText,
    children: [
      { id: 'invoices-list', label: 'All Invoices' },
    ]
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: BarChart3,
    children: [
      { id: 'reports-daily', label: 'Daily Report' },
      { id: 'reports-monthly', label: 'Monthly Report' },
      { id: 'reports-class', label: 'Class Report' },
      { id: 'reports-defaulters', label: 'Defaulters' },
    ]
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings,
    children: [
      { id: 'settings-school', label: 'School Info' },
      { id: 'settings-classes', label: 'Classes' },
      { id: 'settings-fees', label: 'Fee Structure' },
      { id: 'settings-users', label: 'Users' },
      { id: 'settings-google', label: 'Google API' },
      { id: 'settings-backup', label: 'Backup' },
      { id: 'settings-about', label: 'About' },
    ]
  },
];

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['students', 'teachers', 'fees', 'settings']);
  const schoolInfo = getSchoolInfo();
  const currentUser = getCurrentUser();

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const isActive = (id: string) => currentPage === id || currentPage.startsWith(id + '-');

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm truncate">{schoolInfo?.schoolName || 'School Fee Manager'}</h1>
            <p className="text-xs text-gray-400">Fee Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive(item.id) 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {expandedItems.includes(item.id) 
                      ? <ChevronDown className="w-4 h-4" /> 
                      : <ChevronRight className="w-4 h-4" />
                    }
                  </button>
                  {expandedItems.includes(item.id) && (
                    <ul className="mt-1 ml-4 pl-4 border-l border-gray-700 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <button
                            onClick={() => onNavigate(child.id)}
                            className={cn(
                              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                              currentPage === child.id
                                ? 'bg-gray-800 text-white font-medium'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            )}
                          >
                            {child.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    currentPage === item.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {currentUser?.fullName?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser?.fullName || 'Admin'}</p>
            <p className="text-xs text-gray-400 capitalize">{currentUser?.role || 'admin'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
        
        {/* Developer Branding */}
        <div className="mt-3 pt-3 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-500">Developed by</p>
          <p className="text-sm font-bold text-blue-400">MWA</p>
        </div>
      </div>
    </div>
  );
}
