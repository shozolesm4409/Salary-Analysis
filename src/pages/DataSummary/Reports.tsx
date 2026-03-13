import { useState, useRef } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettings } from '@/hooks/useSettings';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import { Download, Calendar } from 'lucide-react';

export default function Reports() {
  const { transactions, loading } = useTransactions();
  const { isTableHidden } = useSettings();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const tableRef = useRef<HTMLTableElement>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get available years from transactions
  const availableYears = Array.from(new Set(transactions.map(t => t.month.split('-')[0]))).sort((a, b) => (b as string).localeCompare(a as string));
  if (availableYears.length === 0) availableYears.push(new Date().getFullYear().toString());

  const filteredTransactions = selectedYear === 'All' 
    ? transactions 
    : transactions.filter(t => t.month.startsWith(selectedYear));

  // Category-wise Expense Data
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  // Category-wise Income Data
  const incomeByCategory = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  // Overall Stats
  const overallIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const overallExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const overallAvailable = overallIncome - overallExpense;
  const overallSaving = filteredTransactions.filter(t => t.category === 'Saving').reduce((sum, t) => sum + t.amount, 0);
  const overallBankLoan = filteredTransactions.filter(t => t.category === 'Bank Loan' && t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const overallHomeExpense = filteredTransactions.filter(t => t.category === 'Home').reduce((sum, t) => sum + t.amount, 0);

  // Monthly Summary Data
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
    return {
      month: monthStr,
      monthName: selectedYear === 'All' ? format(month, 'MMM yy') : format(month, 'MMM'),
      fullMonthName: selectedYear === 'All' ? format(month, 'MMMM yyyy') : format(month, 'MMMM'),
      income,
      expense,
      available: income - expense
    };
  });

  const barData = monthlySummary;
  const yearlyIncome = monthlySummary.reduce((sum, m) => sum + m.income, 0);
  const yearlyExpense = monthlySummary.reduce((sum, m) => sum + m.expense, 0);
  const yearlyAvailable = yearlyIncome - yearlyExpense;

  // Export Functions
  const exportPDF = () => {
    const element = tableRef.current;
    if (!element) return;
    
    const opt: any = {
      margin: 1,
      filename: 'financial-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500">Detailed financial analysis for {selectedYear === 'All' ? 'all time' : selectedYear}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          <button
            onClick={exportPDF}
            className="inline-flex items-center whitespace-nowrap px-2 sm:px-2 py-1 bg-slate-800 text-white text-sm sm:text-base font-medium rounded-l hover:bg-slate-900 transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5 sm:mr-2" />
            PDF
          </button>
          <button
            onClick={exportExcel}
            className="inline-flex items-center whitespace-nowrap px-2 sm:px-2 py-1 bg-emerald-600 text-white text-sm sm:text-base font-medium rounded-l hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-1 sm:mr-1" />
            Excel
          </button>
          <div className="flex items-center gap-1 sm:gap-1 ml-auto sm:ml-1">
            <span className="text-sm font-medium text-slate-500 hidden sm:inline">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-1 sm:px-2 py-1 rounded-l border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium"
            >
              <option value="All">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Home Expense</p>
          <p className="text-xl font-bold text-indigo-600">
            {overallHomeExpense.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Expense Pie Chart */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Category-wise Expenses</h3>
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
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Category-wise Income</h3>
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

        {/* Monthly Comparison Bar Chart */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h3 className="text-lg font-bold text-slate-900">Monthly Financial Flow</h3>
          </div>

          <div className="h-80">
            <h4 className="text-sm font-bold text-slate-700 mb-6 ml-4">Monthly Income vs Expenses ({selectedYear === 'All' ? 'All Time' : selectedYear})</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
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
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <table ref={tableRef} className="w-full min-w-[600px] text-left border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-2 text-sm font-bold">Month Name</th>
                    <th className="px-4 py-2 text-sm font-bold text-center">Income</th>
                    <th className="px-4 py-2 text-sm font-bold text-center">Expenses</th>
                    <th className="px-4 py-2 text-sm font-bold text-right">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthlySummary.map((m) => (
                    <tr key={m.month} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-1 text-sm font-medium text-slate-700">{m.fullMonthName}</td>
                      <td className="px-3 py-1 text-sm text-slate-600 text-center">{m.income.toLocaleString()}</td>
                      <td className="px-3 py-1 text-sm text-slate-600 text-center">{m.expense.toLocaleString()}</td>
                      <td className={`px-3 py-1 text-sm font-bold text-right ${m.available >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {m.available.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-600 text-white font-bold">
                    <td className="px-4 py-2 text-sm">Total Amount</td>
                    <td className="px-4 py-2 text-sm text-center">{yearlyIncome.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-center">{yearlyExpense.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-right">{yearlyAvailable.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
