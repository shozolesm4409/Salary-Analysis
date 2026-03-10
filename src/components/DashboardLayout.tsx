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
  Upload,
  User as UserIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
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

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return FileText;
      case 'UserIcon': return UserIcon;
      default: return FileText;
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:translate-x-0 flex-shrink-0",
        isSidebarOpen ? "w-64" : "w-16",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-4 border-b border-slate-200 justify-between">
            <Link to="/" className={cn("flex items-center", !isSidebarOpen && "justify-center w-full")}>
              <Wallet className="w-8 h-8 text-blue-600 flex-shrink-0" />
              {isSidebarOpen && <span className="text-xl font-bold text-slate-800 ml-2 whitespace-nowrap">Salary Analytics</span>}
            </Link>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block p-1 rounded-lg hover:bg-slate-100">
              {isSidebarOpen ? <ChevronLeft className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
            </button>
          </div>

          <nav className="flex-1 px-2 py-5 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (item.tableKey && isTableHidden(item.tableKey)) return null;
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    !isSidebarOpen && "justify-center"
                  )}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400", isSidebarOpen && "mr-2")} />
                  {isSidebarOpen && item.name}
                </Link>
              );
            })}

            {/* Deleted Link */}
            {!isTableHidden('deleted_transactions') && (
              <Link
                to="/deleted"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors",
                  location.pathname === '/deleted'
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  !isSidebarOpen && "justify-center"
                )}
                title={!isSidebarOpen ? "Deleted" : undefined}
              >
                <Trash2 className={cn("w-5 h-5 flex-shrink-0", location.pathname === '/deleted' ? "text-blue-600" : "text-slate-400", isSidebarOpen && "mr-2")} />
                {isSidebarOpen && "Deleted"}
              </Link>
            )}

            {/* Data Summary Dropdown */}
            <div className="pt-2">
              <button
                onClick={() => isSidebarOpen ? setIsDataSummaryOpen(!isDataSummaryOpen) : setIsSidebarOpen(true)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-lg transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  isDataSummaryOpen && "bg-slate-50",
                  !isSidebarOpen && "justify-center"
                )}
                title={!isSidebarOpen ? "Data Summary" : undefined}
              >
                <div className="flex items-center">
                  <PieChart className={cn("w-5 h-5 flex-shrink-0 text-slate-400", isSidebarOpen && "mr-2")} />
                  {isSidebarOpen && "Data Summary"}
                </div>
                {isSidebarOpen && <ChevronDown className={cn("w-4 h-4 transition-transform", isDataSummaryOpen && "rotate-180")} />}
              </button>
              
              {isSidebarOpen && isDataSummaryOpen && (
                <div className="mt-1 ml-4 border-l border-slate-100 space-y-1">
                  <Link
                    to="/iesd-summary"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
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
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
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
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
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
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
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
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
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
                onClick={() => isSidebarOpen ? setIsMoreOptionsOpen(!isMoreOptionsOpen) : setIsSidebarOpen(true)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-lg transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  isMoreOptionsOpen && "bg-slate-50",
                  !isSidebarOpen && "justify-center"
                )}
                title={!isSidebarOpen ? "More Option" : undefined}
              >
                <div className="flex items-center">
                  <MoreHorizontal className={cn("w-5 h-5 flex-shrink-0 text-slate-400", isSidebarOpen && "mr-2")} />
                  {isSidebarOpen && "More Option"}
                </div>
                {isSidebarOpen && <ChevronDown className={cn("w-4 h-4 transition-transform", isMoreOptionsOpen && "rotate-180")} />}
              </button>
              
              {isSidebarOpen && isMoreOptionsOpen && (
                <div className="mt-1 ml-4 border-l border-slate-100 space-y-1">
                  <Link
                    to="/other-management"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                      location.pathname === '/other-management'
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Other Management
                  </Link>
                  <Link
                    to="/calculation"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
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
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
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
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                      location.pathname === '/upload-transactions'
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Transactions
                  </Link>
                  <Link
                    to="/hazipara-population"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                      location.pathname === '/hazipara-population'
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Hazipara Population
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
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 mr-1"
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
                <p className="text-sm font-medium text-slate-700">{userProfile?.displayName || user?.displayName || 'Full Name'}</p>
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
                  {(userProfile?.displayName || user?.displayName || 'Full Name')?.charAt(0).toUpperCase()}
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
