import React from 'react';
import { format } from 'date-fns';
import { Receipt, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpensesProps {
  stats: any;
  allMonths: string[];
  groupedData: Record<string, Record<string, number>>;
  categories: string[];
  showSummary: boolean;
  setShowSummary: (show: boolean) => void;
  isTableHidden: (key: string) => boolean;
}

export default function Expenses({ stats, allMonths, groupedData, categories, showSummary, setShowSummary, isTableHidden }: ExpensesProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-blue-600">Expenses Overview</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-2 rounded-lg shadow-lg border border-slate-600 text-white text-center">
          <div className="text-xl font-black mb-0.5">{stats.totalIncome.toLocaleString()}</div>
          <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
            <Receipt className="w-3 h-3 mr-1" /> Total Income
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg shadow-lg border border-orange-400 text-white text-center">
          <div className="text-xl font-black mb-0.5">{stats.totalExpenses.toLocaleString()}</div>
          <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
            <TrendingDown className="w-3 h-3 mr-1" /> Total Expenses
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-lg border border-emerald-400 text-white text-center">
          <div className="text-xl font-black mb-0.5">{stats.available.toLocaleString()}</div>
          <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
            <Wallet className="w-3 h-3 mr-1" /> Available
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg border border-purple-400 text-white text-center">
          <div className="text-xl font-black mb-0.5">{stats.totalMonths}</div>
          <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
            <Calendar className="w-3 h-3 mr-1" /> Total Month
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="flex justify-center">
        {!isTableHidden('iesd_summary') && (
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors text-xs sm:text-base"
          >
            {showSummary ? 'Hide Expenses Summary' : 'Show Expenses Summary'}
          </button>
        )}
      </div>

      {/* Summary Table */}
      {showSummary && !isTableHidden('iesd_summary') && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50">SL</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50 min-w-[150px]">ExpenseTypeDetails</th>
                  {allMonths.map(month => (
                    <th key={month} className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50 text-center min-w-[100px]">
                      {format(new Date(month + '-01'), 'MMM-yy')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat, idx) => (
                  <tr key={cat} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-500 border border-slate-100 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800 border border-slate-100">{cat}</td>
                    {allMonths.map(month => {
                      const amount = groupedData[cat]?.[month];
                      return (
                        <td key={month} className="px-4 py-3 text-sm font-medium text-slate-600 border border-slate-100 text-right">
                          {amount ? amount.toLocaleString() : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
