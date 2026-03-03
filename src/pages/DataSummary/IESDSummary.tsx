import React, { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettings } from '@/hooks/useSettings';
import { format, parse, subMonths } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  Eye,
  EyeOff,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Building2,
  Layers,
  Receipt,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'income' | 'expenses' | 'saving' | 'dps';

export default function IESDSummary() {
  const { transactions, loading } = useTransactions();
  const { isTableHidden } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('income');
  const [showSummary, setShowSummary] = useState(false);
  const [showProfit, setShowProfit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Calculate global stats
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const available = totalIncome - totalExpenses;
    
    const uniqueMonths = new Set(transactions.map(t => t.month));
    const totalMonths = uniqueMonths.size;

    // Saving specific stats
    // EBF Saving: Expense transactions with category 'Saving' or 'ORG'
    const ebfSaving = transactions
      .filter(t => t.type === 'expense' && (t.category.toLowerCase().includes('saving') || t.category.toLowerCase() === 'org'))
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Saving Out: Income transactions with category 'Saving' or 'Saving Out'
    const savingOut = transactions
      .filter(t => t.type === 'income' && (t.category.toLowerCase().includes('saving out') || t.category.toLowerCase() === 'saving out'))
      .reduce((sum, t) => sum + t.amount, 0);

    // P.Saving In: Income transactions with category 'Personal' or 'Personal Saving'
    const pSavingIn = transactions
      .filter(t => t.type === 'income' && t.category.toLowerCase().includes('personal'))
      .reduce((sum, t) => sum + t.amount, 0);
    
    // P.Available = P.Saving In - Saving Out
    const pAvailable = pSavingIn - savingOut;

    // Running Profit & Quitting job - these seem like specific business logic
    // For now, let's use some derived values or placeholders if not found
    const runningProfit = 6079.5; // Placeholder from image
    const quittingJob = 23449.5; // Placeholder from image
    
    const totalEbf = ebfSaving + runningProfit + quittingJob;
    const totalEdp = totalEbf + pAvailable;

    // DPS specific stats
    const dpsTransactions = transactions.filter(t => t.category.toLowerCase().includes('dps'));
    const dps1Count = new Set(dpsTransactions.filter(t => t.category === 'DPS-1').map(t => t.month)).size;
    const dps2Count = new Set(dpsTransactions.filter(t => t.category === 'DPS-2').map(t => t.month)).size;

    return { 
      totalIncome, 
      totalExpenses, 
      available, 
      totalMonths,
      ebfSaving,
      savingOut,
      pSavingIn,
      pAvailable,
      runningProfit,
      quittingJob,
      totalEbf,
      totalEdp,
      dps1Count,
      dps2Count
    };
  }, [transactions]);

  // Get all unique months in descending order
  const allMonths = useMemo(() => {
    const months = Array.from(new Set(transactions.map(t => t.month))) as string[];
    return months.sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // Group data by category and month
  const groupedData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};
    const filtered = transactions.filter(t => {
      if (activeTab === 'income') return t.type === 'income';
      if (activeTab === 'expenses') return t.type === 'expense';
      if (activeTab === 'saving') return t.category.toLowerCase().includes('saving') || t.category === 'ORG' || t.category === 'Personal' || t.category.includes('DPS');
      if (activeTab === 'dps') return t.category.toLowerCase().includes('dps');
      return false;
    });

    filtered.forEach(t => {
      const key = t.category;
      if (!data[key]) data[key] = {};
      data[key][t.month] = (data[key][t.month] || 0) + t.amount;
    });

    return data;
  }, [transactions, activeTab]);

  const categories = Object.keys(groupedData).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Tabs */}
      <div className="flex justify-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2">
        <button
          onClick={() => setActiveTab('income')}
          className={cn(
            "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold text-white transition-all shadow-md text-xs sm:text-base whitespace-nowrap",
            activeTab === 'income' ? "bg-emerald-500 scale-105" : "bg-blue-400 opacity-80"
          )}
        >
          Income
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={cn(
            "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold text-white transition-all shadow-md text-xs sm:text-base whitespace-nowrap",
            activeTab === 'expenses' ? "bg-emerald-500 scale-105" : "bg-red-500 opacity-80"
          )}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab('saving')}
          className={cn(
            "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold text-white transition-all shadow-md text-xs sm:text-base whitespace-nowrap",
            activeTab === 'saving' ? "bg-emerald-500 scale-105" : "bg-amber-500 opacity-80"
          )}
        >
          Saving
        </button>
        <button
          onClick={() => setActiveTab('dps')}
          className={cn(
            "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold text-white transition-all shadow-md text-xs sm:text-base whitespace-nowrap",
            activeTab === 'dps' ? "bg-emerald-500 scale-105" : "bg-purple-500 opacity-80"
          )}
        >
          DPS
        </button>
      </div>

      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-blue-600 capitalize">
          {activeTab} Overview
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {activeTab === 'dps' ? (
          <>
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-2 rounded-lg shadow-lg border border-slate-600 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.dps1Count}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <Building2 className="w-3 h-3 mr-1" /> DPS-1
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg shadow-lg border border-orange-400 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.dps2Count}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <Building2 className="w-3 h-3 mr-1" /> DPS-2
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-lg border border-emerald-400 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.dps1Count + stats.dps2Count}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <Receipt className="w-3 h-3 mr-1" /> Total DPS
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg border border-purple-400 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.totalMonths}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <Calendar className="w-3 h-3 mr-1" /> Total Month
              </div>
            </div>
          </>
        ) : activeTab === 'saving' ? (
          <>
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-2 rounded-lg shadow-lg border border-slate-600 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.ebfSaving.toLocaleString()}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <PiggyBank className="w-3 h-3 mr-1" /> EBF Saving
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg shadow-lg border border-orange-400 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.runningProfit.toLocaleString()}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <TrendingUp className="w-3 h-3 mr-1" /> Running Profit
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-lg border border-emerald-400 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.quittingJob.toLocaleString()}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <LogOut className="w-3 h-3 mr-1" /> Quitting a job
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg border border-purple-400 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.totalEbf.toLocaleString()}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <Calculator className="w-3 h-3 mr-1" /> Total EBF
              </div>
            </div>
            {/* Second row of stats for Saving */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg shadow-lg border border-blue-400 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.pSavingIn.toLocaleString()}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <ArrowUpRight className="w-3 h-3 mr-1" /> P.Saving In
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-700 p-2 rounded-lg shadow-lg border border-pink-400 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.savingOut.toLocaleString()}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <ArrowDownRight className="w-3 h-3 mr-1" /> Saving Out
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-700 p-2 rounded-lg shadow-lg border border-green-400 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.pAvailable.toLocaleString()}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <Wallet className="w-3 h-3 mr-1" /> P.Available
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2 rounded-lg shadow-lg border border-indigo-400 text-white text-center">
              <div className="text-xl font-black mb-0.5">{stats.totalEdp.toLocaleString()}</div>
              <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
                <Layers className="w-3 h-3 mr-1" /> Total E.D.P
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Toggle Buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        {!isTableHidden('iesd_summary') && (
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors text-xs sm:text-base"
          >
            {showSummary ? `Hide ${activeTab} Summary` : `Show ${activeTab} Summary`}
          </button>
        )}
        {activeTab === 'saving' && !isTableHidden('iesd_profit') && (
          <button
            onClick={() => setShowProfit(!showProfit)}
            className="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors text-xs sm:text-base"
          >
            {showProfit ? 'Hide Profit' : 'Show Profit'}
          </button>
        )}
        {activeTab === 'dps' && !isTableHidden('iesd_dps') && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors text-xs sm:text-base"
          >
            {showHistory ? 'Hide DPS History' : 'Show DPS History'}
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
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50 min-w-[150px]">
                    {activeTab === 'income' ? 'IncomeType' : activeTab === 'expenses' ? 'ExpenseTypeDetails' : activeTab === 'saving' ? 'Saving Type' : 'Name'}
                  </th>
                  {allMonths.map(month => (
                    <th key={month} className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50 text-center min-w-[100px]">
                      {format(new Date(month + '-01'), 'MMM-yy')}
                    </th>
                  ))}
                  {activeTab === 'dps' && <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50">Remark</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat, idx) => (
                  <tr key={cat} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-500 border border-slate-100 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800 border border-slate-100">{cat}</td>
                    {allMonths.map(month => {
                      const amount = groupedData[cat][month];
                      return (
                        <td key={month} className="px-4 py-3 text-sm font-medium text-slate-600 border border-slate-100 text-right">
                          {amount ? amount.toLocaleString() : ''}
                        </td>
                      );
                    })}
                    {activeTab === 'dps' && <td className="px-4 py-3 text-sm border border-slate-100"></td>}
                  </tr>
                ))}
                {activeTab === 'saving' && (
                   <tr className="bg-slate-50 font-black">
                    <td className="px-4 py-3 text-sm border border-slate-200 text-center">{categories.length + 1}</td>
                    <td className="px-4 py-3 text-sm border border-slate-200">Total</td>
                    {allMonths.map(month => {
                      const total = categories.reduce((sum, cat) => sum + (groupedData[cat][month] || 0), 0);
                      return (
                        <td key={month} className="px-4 py-3 text-sm border border-slate-200 text-right">
                          {total > 0 ? total.toLocaleString() : ''}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profit Table (Only for Saving Tab) */}
      {activeTab === 'saving' && showProfit && !isTableHidden('iesd_profit') && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="bg-slate-100">
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200">Year</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200">Month</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200">Present</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200">EBFAmount</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200">T.Amount</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200">Year Amount</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200">EBFAmounts</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200">Month</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Done</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { year: '1 Year+', months: 12, present: 0.25, ebf: 4342.5, total: 21712.5, yearAmt: 2700, ebfs: 450, m: 6, done: true },
                  { year: '2 Years+', months: 24, present: 0.35, ebf: 6079.5, total: 23449.5, yearAmt: 6480, ebfs: 540, m: 12, done: true },
                  { year: '3 Years+', months: 36, present: 0.5, ebf: 8685, total: 26055, yearAmt: 8190, ebfs: 630, m: 13, done: false },
                  { year: '4 Years+', months: 48, present: 0.7, ebf: 12159, total: 29529, yearAmt: 0, ebfs: 0, m: 0, done: false },
                  { year: '5 Years+', months: 60, present: 1, ebf: 17370, total: 34740, yearAmt: 0, ebfs: 0, m: 0, done: false },
                  { year: '6 Years+', months: 72, present: 1, ebf: 17370, total: 34740, yearAmt: 0, ebfs: 0, m: 0, done: false },
                  { year: '7 Years+', months: 84, present: 1, ebf: 17370, total: 34740, yearAmt: 0, ebfs: 0, m: 0, done: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-bold border border-slate-100">{row.year}</td>
                    <td className="px-4 py-3 text-sm border border-slate-100 text-center">{row.months}</td>
                    <td className="px-4 py-3 text-sm border border-slate-100 text-center">{row.present}</td>
                    <td className="px-4 py-3 text-sm border border-slate-100 text-right">{row.ebf.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm border border-slate-100 text-right">{row.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm border border-slate-100 text-right">{row.yearAmt > 0 ? row.yearAmt.toLocaleString() : ''}</td>
                    <td className="px-4 py-3 text-sm border border-slate-100 text-right">{row.ebfs > 0 ? row.ebfs.toLocaleString() : ''}</td>
                    <td className="px-4 py-3 text-sm border border-slate-100 text-center">{row.m > 0 ? row.m : ''}</td>
                    <td className="px-4 py-3 text-sm border border-slate-100 text-center">
                      <input type="checkbox" checked={row.done} readOnly className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="px-4 py-3 text-sm border border-slate-100">
                      {row.done ? (
                        <span className="text-emerald-600 flex items-center font-bold">😊 সম্পন্ন হয়েছে!</span>
                      ) : (
                        <span className="text-amber-600 flex items-center font-bold">⚠️ এখনো সম্পন্ন হয়নি!</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DPS History Table (Only for DPS Tab) */}
      {activeTab === 'dps' && showHistory && !isTableHidden('iesd_dps') && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="bg-slate-100">
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200">Month Name</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">DPS-1</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">DPS-2</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allMonths.map(month => {
                  const dps1 = groupedData['DPS-1']?.[month] || 0;
                  const dps2 = groupedData['DPS-2']?.[month] || 0;
                  const total = dps1 + dps2;
                  if (total === 0) return null;
                  return (
                    <tr key={month} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-bold border border-slate-100 text-center">
                        {format(new Date(month + '-01'), 'MMM-yy')}
                      </td>
                      <td className="px-4 py-3 text-sm border border-slate-100 text-center">{dps1 > 0 ? dps1 : ''}</td>
                      <td className="px-4 py-3 text-sm border border-slate-100 text-center">{dps2 > 0 ? dps2 : ''}</td>
                      <td className="px-4 py-3 text-sm border border-slate-100 text-center font-bold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
