import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  LogOut, 
  Menu,
  X,
  Wallet,
  Trash2,
  Settings,
  ChevronDown,
  MoreHorizontal,
  FileText,
  BarChart2,
  Activity,
  CreditCard,
  Calculator,
  TrendingUp,
  Upload
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isDeletedOpen, setIsDeletedOpen] = useState(false);
  const { logout, user } = useAuth();
  const { isTableHidden } = useSettings();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<{ displayName?: string; photoBase64?: string } | null>(null);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as any);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const [isDataSummaryOpen, setIsDataSummaryOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt, tableKey: 'transactions' },
    { name: 'TMIEPDF-Filter', href: '/tmiepdf-filter', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 flex-shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-4 border-b border-slate-200">
            <Link to="/" className="flex items-center">
              <Wallet className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-slate-800">FinDash</span>
            </Link>
          </div>

          <nav className="flex-1 px-1.5 py-5 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (item.tableKey && isTableHidden(item.tableKey)) return null;
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center px-2 py-1 text-sm font-medium rounded-l transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5 mr-2", isActive ? "text-blue-600" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}

            {/* Deleted Link */}
            {!isTableHidden('deleted_transactions') && (
              <Link
                to="/deleted"
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center px-2 py-1 text-sm font-medium rounded-l transition-colors",
                  location.pathname === '/deleted'
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Trash2 className={cn("w-5 h-5 mr-2", location.pathname === '/deleted' ? "text-blue-600" : "text-slate-400")} />
                Deleted
              </Link>
            )}

            {/* Data Summary Dropdown */}
            <div className="pt-2">
              <button
                onClick={() => setIsDataSummaryOpen(!isDataSummaryOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1 text-sm font-medium rounded-l transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  isDataSummaryOpen && "bg-slate-50"
                )}
              >
                <div className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-slate-400" />
                  Data Summary
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isDataSummaryOpen && "rotate-180")} />
              </button>
              
              {isDataSummaryOpen && (
                <div className="mt-1 ml-4 border-l border-slate-100 space-y-1">
                  <Link
                    to="/iesd-summary"
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-l transition-colors",
                      location.pathname === '/iesd-summary'
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <BarChart2 className="w-4 h-4 mr-2" />
                    IESD Summary
                  </Link>
                  <Link
                    to="/taken-summary"
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-l transition-colors",
                      location.pathname === '/taken-summary'
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Taken Summary
                  </Link>
                  <Link
                    to="/dsm-dashboard"
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-l transition-colors",
                      location.pathname === '/dsm-dashboard'
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    DSM-Dashboard
                  </Link>
                  <Link
                    to="/categories-summary"
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-l transition-colors",
                      location.pathname === '/categories-summary'
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Categories
                  </Link>
                  <Link
                    to="/loan-flow"
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-l transition-colors",
                      location.pathname === '/loan-flow'
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Loan Flow
                  </Link>
                </div>
              )}
            </div>

            {/* More Options Dropdown */}
            <div className="pt-2">
              <button
                onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1 text-sm font-medium rounded-l transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  isMoreOptionsOpen && "bg-slate-50"
                )}
              >
                <div className="flex items-center">
                  <MoreHorizontal className="w-5 h-5 mr-2 text-slate-400" />
                  More Option
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isMoreOptionsOpen && "rotate-180")} />
              </button>
              
              {isMoreOptionsOpen && (
                <div className="mt-1 ml-4 border-l border-slate-100 space-y-1">
                  <Link
                    to="/calculation"
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-l transition-colors",
                      location.pathname === '/calculation'
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculation
                  </Link>
                  {!isTableHidden('increment_record') && (
                    <Link
                      to="/increment-record"
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-1.5 text-sm font-medium rounded-l transition-colors",
                        location.pathname === '/increment-record'
                          ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Increment Record
                    </Link>
                  )}
                  <Link
                    to="/upload-transactions"
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-l transition-colors",
                      location.pathname === '/upload-transactions'
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Transactions
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-2 lg:px-4">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 rounded-l text-slate-500 hover:bg-slate-100 mr-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center">
              <Wallet className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-slate-800">FinDash</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center">
            <h2 className="text-xl font-semibold text-slate-800 capitalize">
              {location.pathname === '/dashboard' ? 'Overview' : location.pathname.substring(1).replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/edit-profile" className="flex items-center hover:bg-slate-50 p-1 rounded-xl transition-colors">
              <div className="text-right mr-3 hidden sm:block">
                <p className="text-sm font-medium text-slate-700">{userProfile?.displayName || user?.displayName || user?.email}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              {userProfile?.photoBase64 ? (
                <img 
                  src={userProfile.photoBase64} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-xl object-cover border border-blue-200"
                />
              ) : user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-xl object-cover border border-blue-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                  {(userProfile?.displayName || user?.displayName || user?.email)?.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 lg:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
