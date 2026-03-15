import { useState, useMemo } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types';
import { generatePDF } from './utils';

interface TodayFilterProps {
  transactions: Transaction[];
}

export default function TodayFilter({ transactions }: TodayFilterProps) {
  const [todayDate, setTodayDate] = useState<string>('');
  const [showTodayResult, setShowTodayResult] = useState(false);

  const todayTransactions = useMemo(() => {
    if (!todayDate) return [];
    return transactions.filter(t => isSameDay(parseISO(t.date), parseISO(todayDate)));
  }, [transactions, todayDate]);

  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const handleTodaySubmit = () => {
    if (todayDate) setShowTodayResult(true);
  };

  const reset = () => {
    setTodayDate('');
    setShowTodayResult(false);
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-bold text-blue-500">Today Filter</h2>
      <div className="flex justify-center items-center gap-4 flex-wrap">
        <input
          type="date"
          value={todayDate}
          onChange={(e) => setTodayDate(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={handleTodaySubmit}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Show Today
        </button>
      </div>

      {showTodayResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-3 sm:p-4 rounded-lg text-white shadow-lg">
              <h3 className="text-sm sm:text-lg font-semibold mb-1">Total Expense</h3>
              <p className="text-lg sm:text-2xl font-bold">{todayExpense.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-500 p-3 sm:p-4 rounded-lg text-white shadow-lg">
              <h3 className="text-sm sm:text-lg font-semibold mb-1">Total Deposit</h3>
              <p className="text-lg sm:text-2xl font-bold">{todayIncome.toLocaleString()}</p>
            </div>
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
                  {todayTransactions.length > 0 ? (
                    todayTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2">{t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}</td>
                        <td className="px-4 py-2 capitalize">{t.type}</td>
                        <td className="px-4 py-2">{t.category}</td>
                        <td className="px-4 py-2">{t.department}</td>
                        <td className="px-4 py-2 text-right font-bold">
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-red-500 font-bold">
                        No data found for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View for Today Table */}
          <div className="md:hidden space-y-3 text-left">
            {todayTransactions.length > 0 ? (
              todayTransactions.map((t) => (
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
                No data found for this date.
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => generatePDF(todayTransactions, `Transactions_${todayDate}`)}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> PDF-Generate
            </button>
            <button
              onClick={reset}
              className="px-6 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
