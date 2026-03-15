import { useState, useMemo } from 'react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types';

interface MonthlyFilterProps {
  transactions: Transaction[];
}

export default function MonthlyFilter({ transactions }: MonthlyFilterProps) {
  const [monthlyStartDate, setMonthlyStartDate] = useState<string>('');
  const [monthlyEndDate, setMonthlyEndDate] = useState<string>('');
  const [showMonthlyResult, setShowMonthlyResult] = useState(false);
  const [monthlyActiveSubTab, setMonthlyActiveSubTab] = useState<'summary' | 'income' | 'expense'>('summary');

  const monthlyTransactions = useMemo(() => {
    if (!monthlyStartDate || !monthlyEndDate) return [];
    return transactions.filter(t => 
      isWithinInterval(parseISO(t.date), {
        start: parseISO(monthlyStartDate),
        end: parseISO(monthlyEndDate)
      })
    );
  }, [transactions, monthlyStartDate, monthlyEndDate]);

  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const handleMonthlySubmit = () => {
    if (monthlyStartDate && monthlyEndDate) setShowMonthlyResult(true);
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-bold text-blue-500">Monthly Filter</h2>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col text-left gap-1">
            <label className="font-bold text-slate-700 text-sm">Start Date:</label>
            <input
              type="date"
              value={monthlyStartDate}
              onChange={(e) => setMonthlyStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col text-left gap-1">
            <label className="font-bold text-slate-700 text-sm">End Date:</label>
            <input
              type="date"
              value={monthlyEndDate}
              onChange={(e) => setMonthlyEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleMonthlySubmit}
          className="w-full sm:w-auto px-10 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-bold"
        >
          Submit
        </button>
      </div>

      {showMonthlyResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-3 sm:p-4 rounded-lg text-white shadow-lg">
              <h3 className="text-sm sm:text-lg font-semibold mb-1">Total Expense</h3>
              <p className="text-lg sm:text-2xl font-bold">{monthlyExpense.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-500 p-3 sm:p-4 rounded-lg text-white shadow-lg">
              <h3 className="text-sm sm:text-lg font-semibold mb-1">Total Deposit</h3>
              <p className="text-lg sm:text-2xl font-bold">{monthlyIncome.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => setMonthlyActiveSubTab('summary')}
              className={cn(
                "px-4 py-1.5 rounded-md text-white text-sm font-medium transition-colors",
                monthlyActiveSubTab === 'summary' ? "bg-green-600" : "bg-blue-500 hover:bg-blue-600"
              )}
            >
              Summary
            </button>
            <button
              onClick={() => setMonthlyActiveSubTab('income')}
              className={cn(
                "px-4 py-1.5 rounded-md text-white text-sm font-medium transition-colors",
                monthlyActiveSubTab === 'income' ? "bg-green-600" : "bg-green-500 hover:bg-green-600"
              )}
            >
              Income
            </button>
            <button
              onClick={() => setMonthlyActiveSubTab('expense')}
              className={cn(
                "px-4 py-1.5 rounded-md text-white text-sm font-medium transition-colors",
                monthlyActiveSubTab === 'expense' ? "bg-green-600" : "bg-red-500 hover:bg-red-600"
              )}
            >
              Expense
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200 hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Department</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyTransactions
                    .filter(t => {
                      if (monthlyActiveSubTab === 'income') return t.type === 'income';
                      if (monthlyActiveSubTab === 'expense') return t.type === 'expense';
                      return true;
                    })
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2">{t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}</td>
                        <td className="px-4 py-2 capitalize">{t.type}</td>
                        <td className="px-4 py-2">{t.category}</td>
                        <td className="px-4 py-2">{t.department}</td>
                        <td className="px-4 py-2 text-right font-bold">
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  {monthlyTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-red-500 font-bold">
                        No data found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View for Monthly Table */}
          <div className="md:hidden space-y-3 text-left">
            {monthlyTransactions.length > 0 ? (
              monthlyTransactions
                .filter(t => {
                  if (monthlyActiveSubTab === 'income') return t.type === 'income';
                  if (monthlyActiveSubTab === 'expense') return t.type === 'expense';
                  return true;
                })
                .map((t) => (
                  <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500">
                          {t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}
                        </p>
                        <h4 className="text-sm font-bold text-slate-800">{t.category}</h4>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[11px] font-bold",
                          t.type === 'income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-600">{t.department}</span>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-red-500 font-bold shadow-sm">
                No data found for this period.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
