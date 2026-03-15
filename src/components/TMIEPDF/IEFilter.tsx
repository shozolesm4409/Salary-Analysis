import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types';

interface IEFilterProps {
  transactions: Transaction[];
}

export default function IEFilter({ transactions }: IEFilterProps) {
  const [ieFilterType, setIeFilterType] = useState<'Income' | 'Expense' | ''>('');
  const [ieFilterTopic, setIeFilterTopic] = useState<string>('');
  const [showIeResult, setShowIeResult] = useState(false);

  const availableTopics = useMemo(() => {
    if (!ieFilterType) return [];
    const topics = transactions
      .filter(t => t.type === ieFilterType.toLowerCase())
      .map(t => t.category);
    return Array.from(new Set(topics)).sort();
  }, [transactions, ieFilterType]);

  const ieTransactions = useMemo(() => {
    if (!ieFilterType || !ieFilterTopic) return [];
    return transactions.filter(t => 
      t.type === ieFilterType.toLowerCase() && 
      t.category === ieFilterTopic
    );
  }, [transactions, ieFilterType, ieFilterTopic]);

  const ieTotal = ieTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleIeSubmit = () => {
    if (ieFilterType && ieFilterTopic) setShowIeResult(true);
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-bold text-blue-500">Income & Expense Filter</h2>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col text-left gap-1">
            <label className="font-bold text-slate-700 text-sm">Filter Type:</label>
            <select
              value={ieFilterType}
              onChange={(e) => {
                setIeFilterType(e.target.value as 'Income' | 'Expense');
                setIeFilterTopic('');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Type</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          <div className="flex flex-col text-left gap-1">
            <label className="font-bold text-slate-700 text-sm">Filter Topic:</label>
            <select
              value={ieFilterTopic}
              onChange={(e) => setIeFilterTopic(e.target.value)}
              disabled={!ieFilterType}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">Select Topic</option>
              {availableTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleIeSubmit}
          disabled={!ieFilterType || !ieFilterTopic}
          className="w-full sm:w-auto px-10 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed font-bold"
        >
          Submit
        </button>
      </div>

      {showIeResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-md mx-auto">
            <div className={cn(
              "p-4 rounded-lg text-white shadow-lg",
              ieFilterType === 'Income' ? "bg-gradient-to-br from-green-600 to-green-500" : "bg-gradient-to-br from-red-600 to-red-500"
            )}>
              <h3 className="text-lg font-semibold mb-1">Total {ieFilterType}</h3>
              <p className="text-2xl font-bold">{ieTotal.toLocaleString()}</p>
              <p className="text-sm opacity-90 mt-1">Topic: {ieFilterTopic}</p>
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
                  {ieTransactions.map((t) => (
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
                  {ieTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-red-500 font-bold">
                        No data found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View for IE Table */}
          <div className="md:hidden space-y-3 text-left">
            {ieTransactions.length > 0 ? (
              ieTransactions.map((t) => (
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
                No data found for this filter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
