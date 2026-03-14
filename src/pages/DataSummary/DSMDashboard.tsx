import React, { useState, useMemo, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettings } from '@/hooks/useSettings';
import { format, isToday, parseISO, startOfMonth, endOfMonth, isWithinInterval, differenceInMonths } from 'date-fns';
import { useLocation, Link } from 'react-router-dom';
import { 
  Coins, 
  Wallet, 
  Baby, 
  PiggyBank,
  TrendingUp, 
  TrendingDown,
  PieChart, 
  Landmark, 
  Users, 
  ArrowRightLeft, 
  CreditCard, 
  Home, 
  AlertTriangle, 
  Send, 
  CalendarCheck,
  Moon,
  Sun,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'dbp' | 'sdbp';

export default function DSMDashboard() {
  const { transactions, loading } = useTransactions();
  const { isTableHidden } = useSettings();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('dbp');

  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
  }, [location.state]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [showSalarySummary, setShowSalarySummary] = useState(false);
  const [loanSubTab, setLoanSubTab] = useState<'personal' | 'home' | 'bank'>('personal');
  const [personalView, setPersonalView] = useState<'none' | 'taken' | 'lent'>('none');
  const [showHomeLoanSummary, setShowHomeLoanSummary] = useState(false);
  const [bankLoanTable, setBankLoanTable] = useState<'summary' | 'taken' | 'given'>('summary');

  const now = new Date();
  const currentMonthStr = format(now, 'yyyy-MM');

  const stats = useMemo(() => {
    if (!transactions.length) return null;

    const today = transactions.filter(t => isToday(parseISO(t.date)));
    const thisMonth = transactions.filter(t => t.month === currentMonthStr);

    const todayIncome = today.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const todayExpense = today.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const sChildrenBonus = transactions.filter(t => t.category === 'S. Children Bonus').reduce((sum, t) => sum + t.amount, 0);
    const ebfSaving = transactions.filter(t => t.category === 'Saving' && t.department === 'ORG').reduce((sum, t) => sum + Math.abs(t.amount), 0) * 2;

    const monthIncome = thisMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthExpense = thisMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const monthSaving = thisMonth.filter(t => t.category === 'Saving').reduce((sum, t) => sum + t.amount, 0);
    const monthAvailable = monthIncome - monthExpense;

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const available = totalIncome - totalExpenses;

    // Total Month calculation (from first transaction to now)
    const sortedTrans = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    const firstDate = parseISO(sortedTrans[0].date);
    const totalMonths = differenceInMonths(now, firstDate) + 1;

    const totalTaken = transactions.filter(t => t.category.toLowerCase() === 'taken').reduce((sum, t) => sum + t.amount, 0);
    const takenPayment = transactions.filter(t => t.category.toLowerCase() === 'given').reduce((sum, t) => sum + t.amount, 0);
    const totalLent = transactions.filter(t => t.category.toLowerCase() === 'lend').reduce((sum, t) => sum + t.amount, 0);
    const lentPayment = transactions.filter(t => t.category.toLowerCase() === 'give back').reduce((sum, t) => sum + t.amount, 0);

    const homeAmount = transactions.filter(t => t.category === 'Home').reduce((sum, t) => sum + t.amount, 0);
    const bankLoan = transactions.filter(t => t.category === 'Bank Loan' && t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const paidBankLoan = transactions.filter(t => t.category === 'Bank Loan' && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const dueLoan = bankLoan - paidBankLoan;

    const dps1 = transactions.filter(t => (t.category === 'Saving' || t.category === 'Saving Out') && t.department === 'DPS-1').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const dps2 = transactions.filter(t => (t.category === 'Saving' || t.category === 'Saving Out') && t.department === 'DPS-2').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalDps = dps1 + dps2;
    
    // DPS Month (count unique months where DPS transactions occurred)
    const dpsMonths = new Set(transactions.filter(t => (t.category === 'Saving' || t.category === 'Saving Out') && (t.department === 'DPS-1' || t.department === 'DPS-2')).map(t => t.month)).size;

    return {
      todayIncome, todayExpense, sChildrenBonus, ebfSaving,
      monthIncome, monthExpense, monthSaving, monthAvailable,
      totalIncome, totalExpenses, available, totalMonths,
      totalTaken, takenPayment, totalLent, lentPayment,
      homeAmount, bankLoan, paidBankLoan, dueLoan,
      dps1, dps2, totalDps, dpsMonths
    };
  }, [transactions, currentMonthStr]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const boxGradients = [
    'from-[#cc6b00] to-[#b0215d]',
    'from-[#388e3c] to-[#4caf50]',
    'from-[#e65100] to-[#d84315]',
    'from-[#1976d2] to-[#1e88e5]',
    'from-[#7b1fa2] to-[#ab47bc]',
    'from-[#303f9f] to-[#5c6bc0]',
    'from-[#880e4f] to-[#d81b60]',
    'from-[#558b2f] to-[#8bc34a]',
    'from-[#cc8400] to-[#00a136]',
    'from-[#00796b] to-[#00897b]',
    'from-[#b71c1c] to-[#d32f2f]',
    'from-[#0097a7] to-[#00acc1]',
    'from-[#bf360c] to-[#e64a19]',
    'from-[#ff6a00] to-[#ee0979]',
    'from-[#7b1fa2] to-[#ab47bc]',
    'from-[#5e35b1] to-[#7e57c2]',
    'from-[#c0410f] to-[#ff8f00]',
    'from-[#455a64] to-[#546e7a]',
    'from-[#b71c1c] to-[#c62828]',
    'from-[#6a1b9a] to-[#8e24aa]',
    'from-[#388e3c] to-[#4caf50]',
    'from-[#00796b] to-[#00897b]',
    'from-[#ff6a00] to-[#ee0979]',
    'from-[#1976d2] to-[#1e88e5]',
  ];

  return (
    <div className={cn(
      "min-h-full transition-colors duration-300 p-0 rounded-3xl",
      isDarkMode ? "bg-[#1a1a1a] text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1 mb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dbp')}
            className={`px-6 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'dbp' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            DBP
          </button>
          <button
            onClick={() => setActiveTab('sdbp')}
            className={`px-6 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'sdbp' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            SDBP
          </button>
        </div>
        <Link 
          to="/dashboard" 
          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm group shrink-0"
          title="Overview"
        >
          <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </Link>
      </div>

      {activeTab === 'dbp' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!isTableHidden('dsm_financial_dashboard') ? (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black tracking-tight">Financial Dashboard</h1>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { label: 'Today Income', value: stats?.todayIncome, icon: Coins },
                  { label: 'Today Expense', value: stats?.todayExpense, icon: Wallet },
                  { label: 'S. Children Bonus', value: stats?.sChildrenBonus, icon: Baby },
                  { label: 'EBF Saving', value: stats?.ebfSaving, icon: TrendingUp },
                  { label: 'Month Income', value: stats?.monthIncome, icon: Coins },
                  { label: 'Monthly Expense', value: stats?.monthExpense, icon: Wallet },
                  { label: 'Monthly Saving', value: stats?.monthSaving, icon: PieChart },
                  { label: 'Monthly Available', value: stats?.monthAvailable, icon: Landmark },
                  { label: 'Total Income', value: stats?.totalIncome, icon: Coins },
                  { label: 'Total Expenses', value: stats?.totalExpenses, icon: Wallet },
                  { label: 'Available', value: stats?.available, icon: Landmark },
                  { label: 'Total Month', value: stats?.totalMonths, icon: PieChart, isCurrency: false },
                  { label: 'Total Taken', value: stats?.totalTaken, icon: Users },
                  { label: 'Given', value: stats?.takenPayment, icon: CreditCard },
                  { label: 'Total Lend', value: stats?.totalLent, icon: ArrowRightLeft },
                  { label: 'Give Back', value: stats?.lentPayment, icon: CreditCard },
                  { label: 'Home Amount', value: stats?.homeAmount, icon: Home },
                  { label: 'Bank Loan', value: stats?.bankLoan, icon: Landmark },
                  { label: 'Paid Bank Loan', value: stats?.paidBankLoan, icon: CreditCard },
                  { label: 'Due Loan', value: stats?.dueLoan, icon: AlertTriangle },
                  { label: 'DPS-1', value: stats?.dps1, icon: Send },
                  { label: 'DPS-2', value: stats?.dps2, icon: Send },
                  { label: 'Total DPS', value: stats?.totalDps, icon: TrendingUp },
                  { label: 'DPS Month', value: stats?.dpsMonths, icon: CalendarCheck, isCurrency: false },
                ].map((box, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "p-3 rounded-l shadow-lg border-2 border-black/10 transition-all hover:scale-105 group flex flex-row items-center justify-start space-x-3",
                      "bg-gradient-to-br", boxGradients[i]
                    )}
                  >
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                      <box.icon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-black text-white leading-none">
                        {box.isCurrency === false ? box.value : Math.floor(box.value || 0).toLocaleString()}
                      </h2>
                      <p className="text-[10px] font-bold text-white/90 uppercase tracking-wider mt-1">
                        {box.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-3xl shadow-xl">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold">Dashboard Hidden</h2>
              <p className="text-slate-500 mt-2">The Financial Dashboard is currently hidden by administrator settings.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sdbp' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-black text-center">Monthly Live Summary</h1>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'Month Income', value: stats?.monthIncome, gradient: 'from-[#191970] to-[#4169E1]', icon: TrendingUp },
              { label: 'Month Expense', value: stats?.monthExpense, gradient: 'from-[#8B0000] to-[#FF4500]', icon: TrendingDown },
              { label: 'Month Saving', value: stats?.monthSaving, gradient: 'from-[#006400] to-[#228B22]', icon: PiggyBank },
              { label: 'Month Available', value: stats?.monthAvailable, gradient: 'from-[#8B4513] to-[#D2691E]', icon: Landmark },
            ].map((box, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-3 rounded-l shadow-lg text-white transition-all hover:scale-105 group flex flex-row items-center justify-start space-x-3 bg-gradient-to-br", 
                  box.gradient
                )}
              >
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                  <box.icon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-black leading-none">
                    {Math.floor(box.value || 0).toLocaleString()}
                  </h2>
                  <p className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                    {box.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            {!isTableHidden('dsm_monthly_summary') && (
              <button 
                onClick={() => setShowMonthlySummary(!showMonthlySummary)}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all text-xs"
              >
                {showMonthlySummary ? 'Hide Monthly Summary' : 'Show Monthly Summary'}
              </button>
            )}
          </div>

          {showMonthlySummary && !isTableHidden('dsm_monthly_summary') && (
            <div className="bg-white rounded-l shadow-xl overflow-hidden border border-slate-200 mt-6 flex flex-col max-h-[400px]">
              <div className="bg-white px-2 sm:px-3 py-2 border-b border-slate-200 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  Monthly Summary Report
                </h3>
              </div>
              
              <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Month</div>
                <div className="text-center">Income</div>
                <div className="text-center">Expense</div>
                <div className="text-right">Available</div>
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto">
                {/* Logic to generate monthly summary rows */}
                {Array.from({ length: 12 }, (_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  const mStr = format(d, 'yyyy-MM');
                  const mTrans = transactions.filter(t => t.month === mStr);
                  const inc = mTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                  const exp = mTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                  if (inc === 0 && exp === 0) return null;
                  
                  const available = inc - exp;
                  
                  return (
                    <div key={mStr} className="bg-white hover:bg-slate-50 transition-colors group px-4 py-3 sm:px-3 sm:py-1 flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-4">
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                            {format(d, 'MMM')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{format(d, 'MMMM')}</div>
                            <div className="text-xs text-slate-500">{format(d, 'yyyy')}</div>
                          </div>
                        </div>
                        {/* Mobile only available amount */}
                        <div className="sm:hidden text-right">
                          <span className={cn(
                            "font-black text-l",
                            available >= 0 ? "text-blue-600" : "text-rose-600"
                          )}>
                            ৳ {available.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-center sm:col-span-2 gap-4">
                        <div className="flex flex-col sm:items-center w-full sm:w-auto">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:hidden mb-1">Income</span>
                          <span className="inline-flex items-center justify-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-sm w-full sm:w-auto">
                            <TrendingUp className="w-4 h-4 shrink-0" />
                            <span className="truncate">{inc.toLocaleString()}</span>
                          </span>
                        </div>
                        <div className="flex flex-col sm:items-center w-full sm:w-auto">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:hidden mb-1">Expense</span>
                          <span className="inline-flex items-center justify-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg text-sm w-full sm:w-auto">
                            <TrendingDown className="w-4 h-4 shrink-0" />
                            <span className="truncate">{exp.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:block text-right">
                        <span className={cn(
                          "font-black text-l",
                          available >= 0 ? "text-blue-600" : "text-rose-600"
                        )}>
                          ৳ {available.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-center text-slate-400 text-xs mt-12 font-mono">
        Unified Dashboard Version: 2026-03-02 (React Port)
      </p>
    </div>
  );
}
