import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useIncrementRecords } from '@/hooks/useIncrementRecords';
import { useSettings } from '@/hooks/useSettings';
import { format, startOfYear, endOfYear, eachMonthOfInterval, parseISO } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Plus,
  Download,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import TransactionForm from '@/components/TransactionForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const { transactions, loading } = useTransactions();
  const { records: incrementRecords } = useIncrementRecords();
  const { isTableHidden, isButtonHidden } = useSettings();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const currentMonth = format(new Date(), 'yyyy-MM');

  // Calculate Stats
  const currentMonthTransactions = transactions.filter(t => t.month === currentMonth);
  
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netBalance = totalIncome - totalExpense;

  // Chart Data Preparation
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return format(d, 'yyyy-MM');
  }).reverse();

  const chartData = last6Months.map(month => {
    const monthTrans = transactions.filter(t => t.month === month);
    const income = monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      name: format(new Date(month + '-01'), 'MMM'),
      income,
      expense
    };
  });

  // Analytics & Reports Logic
  const availableYears = Array.from(new Set(transactions.map(t => t.month.split('-')[0]))).sort((a, b) => (b as string).localeCompare(a as string));
  if (availableYears.length === 0) availableYears.push(new Date().getFullYear().toString());

  const filteredTransactions = selectedYear === 'All' 
    ? transactions 
    : transactions.filter(t => t.month.startsWith(selectedYear));

  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  const incomeByCategory = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));

  // Increment Records Data
  const incrementByYear = incrementRecords.reduce((acc, record) => {
    acc[record.year] = (acc[record.year] || 0) + record.amount;
    return acc;
  }, {} as Record<string, number>);

  const incrementPieData = Object.entries(incrementByYear).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const overallIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const overallExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const overallAvailable = overallIncome - overallExpense;
  const overallSaving = filteredTransactions.filter(t => t.category === 'Saving').reduce((sum, t) => sum + t.amount, 0);
  const overallBankLoan = filteredTransactions.filter(t => t.category === 'Bank Loan' && t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const overallPaidBankLoan = filteredTransactions.filter(t => t.category === 'Bank Loan' && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const overallDueBankLoan = overallBankLoan - overallPaidBankLoan;
  const overallHomeExpense = filteredTransactions.filter(t => t.category === 'Home Expense').reduce((sum, t) => sum + t.amount, 0);
  const overallSalary = filteredTransactions.filter(t => t.category === 'Salary').reduce((sum, t) => sum + t.amount, 0);
  const currentMonthSalary = currentMonthTransactions.filter(t => t.category === 'Salary').reduce((sum, t) => sum + t.amount, 0);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTransactions = transactions.filter(t => t.date === today);
  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  let monthsToDisplay: Date[] = [];
  if (selectedYear === 'All') {
    if (transactions.length > 0) {
      const sortedMonths = [...transactions].sort((a, b) => a.month.localeCompare(b.month));
      const firstMonth = new Date(sortedMonths[0].month + '-01');
      const lastMonth = new Date(sortedMonths[sortedMonths.length - 1].month + '-01');
      monthsToDisplay = eachMonthOfInterval({ start: firstMonth, end: lastMonth });
    } else {
      monthsToDisplay = eachMonthOfInterval({
        start: startOfYear(new Date()),
        end: endOfYear(new Date())
      });
    }
  } else {
    monthsToDisplay = eachMonthOfInterval({
      start: startOfYear(new Date(parseInt(selectedYear), 0, 1)),
      end: endOfYear(new Date(parseInt(selectedYear), 0, 1))
    });
  }

  const monthlySummary = monthsToDisplay.map(month => {
    const monthStr = format(month, 'yyyy-MM');
    const monthTransactions = filteredTransactions.filter(t => t.month === monthStr);
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const salary = monthTransactions.filter(t => t.category === 'Salary').reduce((sum, t) => sum + t.amount, 0);
    return {
      month: monthStr,
      monthName: selectedYear === 'All' ? format(month, 'MMM yy') : format(month, 'MMM'),
      fullMonthName: selectedYear === 'All' ? format(month, 'MMMM yyyy') : format(month, 'MMMM'),
      income,
      expense,
      salary,
      available: income - expense
    };
  });

  const yearlyIncome = monthlySummary.reduce((sum, m) => sum + m.income, 0);
  const yearlyExpense = monthlySummary.reduce((sum, m) => sum + m.expense, 0);
  const yearlyAvailable = yearlyIncome - yearlyExpense;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Financial Report', 14, 15);
    const tableData = transactions.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.type,
      t.category,
      t.department,
      t.amount.toString()
    ]);
    autoTable(doc, {
      head: [['Date', 'Type', 'Category', 'Department', 'Amount']],
      body: tableData,
      startY: 20,
    });
    doc.save('financial-report.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions.map(t => ({
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Department: t.department,
      Amount: t.amount,
      Description: t.description
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "financial-report.xlsx");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Financial summary for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {!isButtonHidden('dashboard_pdf') && (
            <button
              onClick={exportPDF}
              className="inline-flex items-center whitespace-nowrap px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
          )}
          {!isButtonHidden('dashboard_excel') && (
            <button
              onClick={exportExcel}
              className="inline-flex items-center whitespace-nowrap px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </button>
          )}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium shadow-sm"
          >
            <option value="All">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <div className="bg-white p-2 rounded-l shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Income</p>
          <p className="text-xl font-bold text-emerald-600">{overallIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-2 rounded-l shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Expenses</p>
          <p className="text-xl font-bold text-red-600">{overallExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-2 rounded-l shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Net Balance</p>
          <p className={`text-xl font-bold ${overallAvailable >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {overallAvailable.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-2 rounded-l shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Saving</p>
          <p className="text-xl font-bold text-amber-600">
            {overallSaving.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-2 rounded-l shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Bank Loan</p>
          <p className="text-xl font-bold text-blue-600">
            {overallBankLoan.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-2 rounded-l shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Paid Loan</p>
          <p className="text-xl font-bold text-green-600">
            {overallPaidBankLoan.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-2 rounded-l shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Due Loan</p>
          <p className="text-xl font-bold text-orange-600">
            {overallDueBankLoan.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-2 rounded-l shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Home Expense</p>
          <p className="text-xl font-bold text-indigo-600">
            {overallHomeExpense.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Salary Analytics Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Salary Analytics</h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-l shadow-md text-white lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-100">Monthly Income</p>
              <DollarSign className="w-5 h-5 text-blue-200" />
            </div>
            <p className="text-2xl font-bold">৳ {totalIncome.toLocaleString()}</p>
            <p className="text-xs text-blue-200 mt-1">For {format(new Date(), 'MMMM yyyy')}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-2 rounded-l shadow-md text-white lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-emerald-100">Yearly Income</p>
              <TrendingUp className="w-5 h-5 text-emerald-200" />
            </div>
            <p className="text-2xl font-bold">৳ {yearlyIncome.toLocaleString()}</p>
            <p className="text-xs text-emerald-200 mt-1">For {selectedYear === 'All' ? 'All Time' : selectedYear}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-2 rounded-l shadow-md text-white lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-100">Today Income</p>
              <ArrowUpRight className="w-5 h-5 text-green-200" />
            </div>
            <p className="text-2xl font-bold">৳ {todayIncome.toLocaleString()}</p>
            <p className="text-xs text-green-200 mt-1">For {format(new Date(), 'dd MMM yyyy')}</p>
          </div>

          <div className="bg-gradient-to-br from-rose-600 to-pink-700 p-2 rounded-l shadow-md text-white lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-rose-100">Today Expenses</p>
              <ArrowDownRight className="w-5 h-5 text-rose-200" />
            </div>
            <p className="text-2xl font-bold">৳ {todayExpense.toLocaleString()}</p>
            <p className="text-xs text-rose-200 mt-1">For {format(new Date(), 'dd MMM yyyy')}</p>
          </div>

          <div className="bg-white p-2 rounded-l shadow-sm border border-slate-100 col-span-2 lg:col-span-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Salary Trend ({selectedYear === 'All' ? 'All Time' : selectedYear})</h3>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySummary}>
                  <defs>
                    <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="salary" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSalary)" 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    formatter={(value: number) => `৳ ${value.toLocaleString()}`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Financial Flow Bar Chart */}
        <div className="bg-white p-3 rounded-l shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Monthly Financial Flow ({selectedYear === 'All' ? 'All Time' : selectedYear})</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  labelFormatter={(label, payload) => payload[0]?.payload?.fullMonthName || label}
                />
                <Legend verticalAlign="top" align="left" height={36}/>
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Summary Table */}
          {!isTableHidden('reports_monthly') && (
            <div className="mt-8 rounded-l border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col max-h-[400px]">
              <div className="hidden sm:flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                <div className="w-48 shrink-0">Month</div>
                <div className="flex-1 flex justify-center gap-4">
                  <div className="w-32 text-center">Income</div>
                  <div className="w-32 text-center">Expense</div>
                </div>
                <div className="w-32 shrink-0 text-right">Available</div>
              </div>
              <div className="divide-y divide-slate-100 overflow-y-auto">
                {monthlySummary.map((m) => {
                  const monthDate = parseISO(`${m.month}-01`);
                  return (
                    <div key={m.month} className="hover:bg-slate-50 transition-colors group px-4 py-3 sm:px-3 sm:py-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                      <div className="flex items-center justify-between sm:w-48 shrink-0">
                        <div>
                          <div className="font-bold text-slate-900 text-base">{format(monthDate, 'MMMM')}</div>
                          <div className="text-xs text-slate-500">{format(monthDate, 'yyyy')}</div>
                        </div>
                        {/* Mobile only available amount */}
                        <div className="sm:hidden text-right">
                          <span className={cn(
                            "font-black text-l",
                            m.available >= 0 ? "text-blue-600" : "text-rose-600"
                          )}>
                            ৳ {m.available.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-center gap-4 flex-1">
                        <div className="flex flex-col sm:items-center w-full sm:w-32">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:hidden mb-1">Income</span>
                          <span className="inline-flex items-center justify-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-sm w-full">
                            <TrendingUp className="w-4 h-4 shrink-0" />
                            <span className="truncate">{m.income.toLocaleString()}</span>
                          </span>
                        </div>
                        <div className="flex flex-col sm:items-center w-full sm:w-32">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:hidden mb-1">Expense</span>
                          <span className="inline-flex items-center justify-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg text-sm w-full">
                            <TrendingDown className="w-4 h-4 shrink-0" />
                            <span className="truncate">{m.expense.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:block text-right sm:w-32 shrink-0">
                        <span className={cn(
                          "font-black text-l",
                          m.available >= 0 ? "text-blue-600" : "text-rose-600"
                        )}>
                          ৳ {m.available.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Category Expense Pie Chart */}
        <div className="bg-white p-3 rounded-l shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Category-wise Expenses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Income Pie Chart */}
        <div className="bg-white p-3 rounded-l shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Category-wise Income</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#10b981"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incomePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Increment Record Pie Chart */}
        <div className="bg-white p-3 rounded-l shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Increment Record (Year vs Amount)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incrementPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#f59e0b"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incrementPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="bg-white p-3 rounded-l shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Income vs Expense (Last 6 Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="bg-white p-3 rounded-l shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Financial Trend (Last 6 Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  name="Income Trend"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <TransactionForm 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
