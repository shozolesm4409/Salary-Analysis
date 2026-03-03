import React, { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useIncrementRecords } from '@/hooks/useIncrementRecords';
import { useSettings } from '@/hooks/useSettings';
import { format, isToday, parseISO, startOfMonth, endOfMonth, isWithinInterval, differenceInMonths } from 'date-fns';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Coins, 
  Wallet, 
  Baby, 
  TrendingUp, 
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
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'dbp' | 'sdbp' | 'mdbp' | 'loan';

export default function DSMDashboard() {
  const { transactions, loading } = useTransactions();
  const { records: incrementRecords, loading: incrementLoading } = useIncrementRecords();
  const { isTableHidden } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('dbp');
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
    const ebfSaving = transactions.filter(t => t.category === 'EBF Saving').reduce((sum, t) => sum + t.amount, 0);

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

    const totalTaken = transactions.filter(t => t.category === 'Loan Taken').reduce((sum, t) => sum + t.amount, 0);
    const takenPayment = transactions.filter(t => t.category === 'Loan Taken Payment').reduce((sum, t) => sum + t.amount, 0);
    const totalLent = transactions.filter(t => t.category === 'Loan Lent').reduce((sum, t) => sum + t.amount, 0);
    const lentPayment = transactions.filter(t => t.category === 'Loan Lent Payment').reduce((sum, t) => sum + t.amount, 0);

    const homeAmount = transactions.filter(t => t.category === 'Home Amount').reduce((sum, t) => sum + t.amount, 0);
    const bankLoan = transactions.filter(t => t.category === 'Bank Loan').reduce((sum, t) => sum + t.amount, 0);
    const paidBankLoan = transactions.filter(t => t.category === 'Bank Loan Payment').reduce((sum, t) => sum + t.amount, 0);
    const dueLoan = bankLoan - paidBankLoan;

    const dps1 = transactions.filter(t => t.category === 'DPS-1').reduce((sum, t) => sum + t.amount, 0);
    const dps2 = transactions.filter(t => t.category === 'DPS-2').reduce((sum, t) => sum + t.amount, 0);
    const totalDps = dps1 + dps2;
    
    // DPS Month (count unique months where DPS transactions occurred)
    const dpsMonths = new Set(transactions.filter(t => t.category.startsWith('DPS')).map(t => t.month)).size;

    return {
      todayIncome, todayExpense, sChildrenBonus, ebfSaving,
      monthIncome, monthExpense, monthSaving, monthAvailable,
      totalIncome, totalExpenses, available, totalMonths,
      totalTaken, takenPayment, totalLent, lentPayment,
      homeAmount, bankLoan, paidBankLoan, dueLoan,
      dps1, dps2, totalDps, dpsMonths
    };
  }, [transactions, currentMonthStr]);

  const incrementChartData = useMemo(() => {
    if (!incrementRecords.length) return [];
    
    // Group by year and sum amounts
    const grouped = incrementRecords.reduce((acc, record) => {
      const year = record.year;
      acc[year] = (acc[year] || 0) + record.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [incrementRecords]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  if (loading || incrementLoading) {
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
      <div className="flex justify-center gap-1 mb-4 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'dbp', label: 'DBP', color: 'bg-blue-600' },
          { id: 'sdbp', label: 'SDBP', color: 'bg-purple-600' },
          { id: 'mdbp', label: 'MDBP', color: 'bg-orange-600' },
          { id: 'loan', label: 'Loan', color: 'bg-amber-600' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold text-white transition-all transform hover:scale-105 text-xs sm:text-sm whitespace-nowrap",
              tab.color,
              activeTab === tab.id ? "ring-2 ring-offset-1 ring-blue-400 scale-105" : "opacity-80"
            )}
          >
            {tab.label}
          </button>
        ))}
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
                  { label: 'Taken Payment', value: stats?.takenPayment, icon: CreditCard },
                  { label: 'Total Lent', value: stats?.totalLent, icon: ArrowRightLeft },
                  { label: 'Lent Payment', value: stats?.lentPayment, icon: CreditCard },
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
                      "p-2 rounded-lg shadow-lg border-2 border-black/10 transition-all hover:scale-105 group",
                      "bg-gradient-to-br", boxGradients[i]
                    )}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <box.icon className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                    </div>
                    <h2 className="text-xl font-black text-white text-center">
                      {box.isCurrency === false ? box.value : Math.floor(box.value || 0).toLocaleString()}
                    </h2>
                    <p className="text-[10px] font-bold text-white/90 text-center uppercase tracking-wider mt-0.5">
                      {box.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Increment Record Pie Chart */}
              {!isTableHidden('increment_record') && incrementChartData.length > 0 && (
                <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-center mb-6 text-slate-800 dark:text-white">Increment Record Overview (Year vs Amount)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={incrementChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {incrementChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
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
            {/* Reusing DBP boxes logic for SDBP as per original HTML structure */}
            {[
              { label: 'Current Month Income', value: stats?.monthIncome, gradient: 'from-[#191970] to-[#4169E1]' },
              { label: 'Current Month Expense', value: stats?.monthExpense, gradient: 'from-[#8B0000] to-[#FF4500]' },
              { label: 'Current Month Saving', value: stats?.monthSaving, gradient: 'from-[#006400] to-[#228B22]' },
              { label: 'Current Month Available', value: stats?.monthAvailable, gradient: 'from-[#8B4513] to-[#D2691E]' },
            ].map((box, i) => (
              <div key={i} className={cn("p-2 rounded-lg shadow-lg text-white text-center bg-gradient-to-br", box.gradient)}>
                <h2 className="text-xl font-black">{Math.floor(box.value || 0).toLocaleString()}</h2>
                <p className="text-[10px] font-bold mt-0.5 uppercase">{box.label}</p>
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="px-6 py-4 font-bold uppercase tracking-wider">Month</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">Income</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">Expense</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {/* Logic to generate monthly summary rows */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - i);
                      const mStr = format(d, 'yyyy-MM');
                      const mTrans = transactions.filter(t => t.month === mStr);
                      const inc = mTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                      const exp = mTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                      if (inc === 0 && exp === 0) return null;
                      return (
                        <tr key={mStr} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 font-medium">{format(d, 'MMMM yyyy')}</td>
                          <td className="px-6 py-4 text-center text-emerald-600 font-bold">{inc.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center text-red-600 font-bold">{exp.toLocaleString()}</td>
                          <td className={cn("px-6 py-4 text-right font-black", (inc - exp) >= 0 ? "text-blue-600" : "text-red-600")}>
                            {(inc - exp).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'mdbp' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-black text-center">Salary Summary</h1>
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-2 rounded-full text-white font-bold shadow-lg">
              {format(now, 'MMMM yyyy')}
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'Monthly Salary', value: transactions.filter(t => t.category === 'Salary' && t.month === currentMonthStr).reduce((s, t) => s + t.amount, 0), gradient: 'from-[#196f3d] to-[#27ae60]' },
              { label: 'Bonus Received', value: transactions.filter(t => t.category === 'Bonus' && t.month === currentMonthStr).reduce((s, t) => s + t.amount, 0), gradient: 'from-[#ff6a00] to-[#ee0979]' },
              { label: 'Total Earnings', value: transactions.filter(t => t.type === 'income' && t.month === currentMonthStr).reduce((s, t) => s + t.amount, 0), gradient: 'from-[#43cea2] to-[#185a9d]' },
              { label: 'Net Pay', value: transactions.filter(t => t.type === 'income' && t.month === currentMonthStr).reduce((s, t) => s + t.amount, 0), gradient: 'from-[#6a11cb] to-[#2575fc]' },
            ].map((box, i) => (
              <div key={i} className={cn("p-2 rounded-lg shadow-lg text-white text-center bg-gradient-to-br", box.gradient)}>
                <h2 className="text-xl font-black">{Math.floor(box.value || 0).toLocaleString()}</h2>
                <p className="text-[10px] font-bold mt-0.5 uppercase">{box.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            {!isTableHidden('dsm_salary_summary') && (
              <button 
                onClick={() => setShowSalarySummary(!showSalarySummary)}
                className="bg-orange-600 text-white px-3 py-1 rounded-lg font-bold shadow-lg hover:bg-orange-700 transition-all text-xs"
              >
                {showSalarySummary ? 'Hide Salary Summary' : 'Show Salary Summary'}
              </button>
            )}
          </div>

          {showSalarySummary && !isTableHidden('dsm_salary_summary') && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-orange-600 text-white">
                      <th className="px-6 py-4 font-bold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {transactions.filter(t => t.type === 'income' && t.month === currentMonthStr).map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">{t.date}</td>
                        <td className="px-6 py-4">{t.category}</td>
                        <td className="px-6 py-4 text-right font-bold text-orange-600">{t.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'loan' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-black text-center">
            {loanSubTab === 'personal' ? 'Personal Loan History' : 
             loanSubTab === 'home' ? 'Home & Bank History' : 'Bank Loan History'}
          </h1>
          
          <div className="flex justify-center gap-2">
            {[
              { id: 'personal', label: 'P. Loan' },
              { id: 'home', label: 'Home & Bank' },
              { id: 'bank', label: 'Bank Loan' }
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setLoanSubTab(sub.id as any)}
                className={cn(
                  "px-3 py-1 rounded-lg font-bold transition-all text-xs",
                  loanSubTab === sub.id ? "bg-amber-600 text-white shadow-lg" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {loanSubTab === 'personal' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {[
                  { label: 'Total Taken', value: stats?.totalTaken, gradient: 'from-[#196f3d] to-[#27ae60]' },
                  { label: 'Taken Payment', value: stats?.takenPayment, gradient: 'from-[#6a11cb] to-[#2575fc]' },
                  { label: 'Due Payment', value: (stats?.totalTaken || 0) - (stats?.takenPayment || 0), gradient: 'from-[#7b4397] to-[#dc2430]' },
                  { label: 'Total Lent', value: stats?.totalLent, gradient: 'from-[#34e89e] to-[#0f3443]' },
                  { label: 'Lent Payment', value: stats?.lentPayment, gradient: 'from-[#b71c1c] to-[#4a0000]' },
                  { label: 'Due Lent', value: (stats?.totalLent || 0) - (stats?.lentPayment || 0), gradient: 'from-[#0d47a1] to-[#001f4d]' },
                ].map((box, i) => (
                  <div key={i} className={cn("p-2 rounded-lg shadow-lg text-white text-center bg-gradient-to-br", box.gradient)}>
                    <h2 className="text-xl font-black">{Math.floor(box.value || 0).toLocaleString()}</h2>
                    <p className="text-[10px] font-bold mt-0.5 uppercase">{box.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                {!isTableHidden('dsm_personal_loan') && (
                  <>
                    <button 
                      onClick={() => setPersonalView(personalView === 'taken' ? 'none' : 'taken')}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all text-xs"
                    >
                      {personalView === 'taken' ? 'Hide Taken' : 'View Taken'}
                    </button>
                    <button 
                      onClick={() => setPersonalView(personalView === 'lent' ? 'none' : 'lent')}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold shadow-md hover:bg-red-700 transition-all text-xs"
                    >
                      {personalView === 'lent' ? 'Hide Lent' : 'View Lent'}
                    </button>
                  </>
                )}
              </div>

              {personalView !== 'none' && !isTableHidden('dsm_personal_loan') && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Description</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {transactions.filter(t => 
                          personalView === 'taken' ? (t.category === 'Loan Taken' || t.category === 'Loan Taken Payment') :
                          (t.category === 'Loan Lent' || t.category === 'Loan Lent Payment')
                        ).map((t, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4">{t.date}</td>
                            <td className="px-6 py-4">{t.description || t.category}</td>
                            <td className={cn("px-6 py-4 text-right font-bold", t.category.includes('Payment') ? "text-emerald-600" : "text-red-600")}>
                              {t.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {loanSubTab === 'home' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { label: 'Home Total', value: stats?.homeAmount, gradient: 'box-1' },
                  { label: 'Bank Total', value: stats?.bankLoan, gradient: 'box-2' },
                  { label: 'Paid Bank', value: stats?.paidBankLoan, gradient: 'box-3' },
                  { label: 'Due Bank', value: stats?.dueLoan, gradient: 'box-4' },
                ].map((box, i) => (
                  <div key={i} className={cn("p-2 rounded-lg shadow-lg text-white text-center bg-gradient-to-br", 
                    i === 0 ? "from-[#196f3d] to-[#27ae60]" :
                    i === 1 ? "from-[#6a11cb] to-[#2575fc]" :
                    i === 2 ? "from-[#43cea2] to-[#185a9d]" : "from-[#ff6a00] to-[#ee0979]"
                  )}>
                    <h2 className="text-xl font-black">{Math.floor(box.value || 0).toLocaleString()}</h2>
                    <p className="text-[10px] font-bold mt-0.5 uppercase">{box.label}</p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                {!isTableHidden('dsm_home_bank_loan') && (
                  <button 
                    onClick={() => setShowHomeLoanSummary(!showHomeLoanSummary)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all text-xs"
                  >
                    {showHomeLoanSummary ? 'Hide Loan Summary' : 'Show Loan Summary'}
                  </button>
                )}
              </div>

              {showHomeLoanSummary && !isTableHidden('dsm_home_bank_loan') && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {transactions.filter(t => t.category === 'Home Amount' || t.category === 'Bank Loan' || t.category === 'Bank Loan Payment').map((t, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4">{t.date}</td>
                            <td className="px-6 py-4">{t.category}</td>
                            <td className="px-6 py-4 text-right font-bold">{t.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {loanSubTab === 'bank' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { label: 'Total Loan', value: stats?.bankLoan, gradient: 'from-[#b32b2b] to-[#b34724]' },
                  { label: 'Paid Amount', value: stats?.paidBankLoan, gradient: 'from-[#2c70b3] to-[#009aa6]' },
                  { label: 'Due Balance', value: stats?.dueLoan, gradient: 'from-[#279945] to-[#20a88a]' },
                  { label: 'Installments', value: transactions.filter(t => t.category === 'Bank Loan Payment').length, gradient: 'from-[#b33861] to-[#b38f00]', isCurrency: false },
                ].map((box, i) => (
                  <div key={i} className={cn("p-2 rounded-lg shadow-lg text-white text-center bg-gradient-to-br", box.gradient)}>
                    <h2 className="text-xl font-black">
                      {box.isCurrency === false ? box.value : Math.floor(box.value || 0).toLocaleString()}
                    </h2>
                    <p className="text-[10px] font-bold mt-0.5 uppercase">{box.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-2">
                {[
                  { id: 'summary', label: 'Summary', color: 'bg-blue-700' },
                  { id: 'taken', label: 'Taken', color: 'bg-emerald-700' },
                  { id: 'given', label: 'Given', color: 'bg-red-700' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setBankLoanTable(sub.id as any)}
                    className={cn(
                      "px-3 py-1 rounded-lg font-bold text-white transition-all text-xs",
                      sub.color,
                      bankLoanTable === sub.id ? "ring-2 ring-offset-1 ring-slate-400 scale-105" : "opacity-80"
                    )}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {!isTableHidden('dsm_bank_loan') ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-600 text-white">
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Reference</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {transactions.filter(t => 
                          bankLoanTable === 'summary' ? (t.category === 'Bank Loan' || t.category === 'Bank Loan Payment') :
                          bankLoanTable === 'taken' ? (t.category === 'Bank Loan') : (t.category === 'Bank Loan Payment')
                        ).map((t, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4">{t.date}</td>
                            <td className="px-6 py-4">{t.description || t.category}</td>
                            <td className="px-6 py-4 text-right font-bold">{t.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 italic">
                    This table is hidden by administrator settings.
                  </div>
                )}
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
