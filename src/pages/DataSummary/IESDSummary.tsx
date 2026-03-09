import React, { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettings } from '@/hooks/useSettings';
import { useProfitRecords } from '@/hooks/useProfitRecords';
import { cn } from '@/lib/utils';
import Income from './iesd-summary/Income';
import Expenses from './iesd-summary/Expenses';
import Saving from './iesd-summary/Saving';
import DPS from './iesd-summary/DPS';

type TabType = 'income' | 'expenses' | 'saving' | 'dps';

export default function IESDSummary() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { records: profitRecords, loading: profitLoading } = useProfitRecords();
  const { isTableHidden } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('income');
  const [showSummary, setShowSummary] = useState(false);
  const [showProfit, setShowProfit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loading = transactionsLoading || profitLoading;

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
    const pSavingIn = transactions
      .filter(t => t.category === 'Saving' && t.department === 'Personal')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const savingOut = transactions
      .filter(t => t.category === 'Saving Out' && t.department === 'Personal')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const pAvailable = pSavingIn - savingOut;

    const ebfSaving = transactions
      .filter(t => t.category === 'Saving' && t.department === 'ORG')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalEbf = ebfSaving * 2;

    // DPS specific stats
    const dps1Amount = transactions
      .filter(t => (t.category === 'Saving' || t.category === 'Saving Out') && t.department === 'DPS-1')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const dps2Amount = transactions
      .filter(t => (t.category === 'Saving' || t.category === 'Saving Out') && t.department === 'DPS-2')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalDps = dps1Amount + dps2Amount;

    const dpsMonths = new Set(
      transactions
        .filter(t => (t.category === 'Saving' || t.category === 'Saving Out') && (t.department === 'DPS-1' || t.department === 'DPS-2'))
        .map(t => t.month)
    );
    const dpsTotalMonths = dpsMonths.size;

    // New calculations for Saving cards
    const doneRecords = profitRecords.filter(r => r.done);
    const lastDoneRecord = doneRecords.length > 0 ? doneRecords[doneRecords.length - 1] : null;
    
    let runningProfit = 0;
    let quittingJob = 0;

    if (lastDoneRecord) {
      const presentVal = lastDoneRecord.present > 1 ? lastDoneRecord.present / 100 : lastDoneRecord.present;
      runningProfit = Math.round(ebfSaving * presentVal);
      quittingJob = Math.round(ebfSaving + runningProfit);
    }

    const totalEDP = pAvailable + ebfSaving + totalDps;

    return { 
      totalIncome, 
      totalExpenses, 
      available, 
      totalMonths,
      ebfSaving,
      savingOut,
      pSavingIn,
      pAvailable,
      totalEbf,
      dps1Amount,
      dps2Amount,
      totalDps,
      dpsTotalMonths,
      runningProfit,
      quittingJob,
      totalEDP
    };
  }, [transactions, profitRecords]);

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
      if (activeTab === 'saving') {
        return (t.category === 'Saving' && (t.department === 'Personal' || t.department === 'ORG')) || 
               (t.category === 'Saving Out' && t.department === 'Personal');
      }
      if (activeTab === 'dps') {
        return (t.category === 'Saving' || t.category === 'Saving Out') && (t.department === 'DPS-1' || t.department === 'DPS-2');
      }
      return false;
    });

    filtered.forEach(t => {
      let key = t.category;
      if (activeTab === 'dps') {
        key = t.department;
      } else if (activeTab === 'saving') {
        if (t.category === 'Saving') {
          key = t.department === 'Personal' ? 'P.Saving In' : 'EBF Saving';
        } else if (t.category === 'Saving Out') {
          key = 'Saving Out';
        }
      }
      
      if (!data[key]) data[key] = {};
      const amount = (activeTab === 'saving' || activeTab === 'dps') ? Math.abs(t.amount) : t.amount;
      data[key][t.month] = (data[key][t.month] || 0) + amount;
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
          onClick={() => { setActiveTab('income'); setShowSummary(false); }}
          className={cn(
            "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold text-white transition-all shadow-md text-xs sm:text-base whitespace-nowrap",
            activeTab === 'income' ? "bg-emerald-500 scale-105" : "bg-blue-400 opacity-80"
          )}
        >
          Income
        </button>
        <button
          onClick={() => { setActiveTab('expenses'); setShowSummary(false); }}
          className={cn(
            "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold text-white transition-all shadow-md text-xs sm:text-base whitespace-nowrap",
            activeTab === 'expenses' ? "bg-emerald-500 scale-105" : "bg-red-500 opacity-80"
          )}
        >
          Expenses
        </button>
        <button
          onClick={() => { setActiveTab('saving'); setShowSummary(false); }}
          className={cn(
            "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold text-white transition-all shadow-md text-xs sm:text-base whitespace-nowrap",
            activeTab === 'saving' ? "bg-emerald-500 scale-105" : "bg-amber-500 opacity-80"
          )}
        >
          Saving
        </button>
        <button
          onClick={() => { setActiveTab('dps'); setShowSummary(false); }}
          className={cn(
            "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold text-white transition-all shadow-md text-xs sm:text-base whitespace-nowrap",
            activeTab === 'dps' ? "bg-emerald-500 scale-105" : "bg-purple-500 opacity-80"
          )}
        >
          DPS
        </button>
      </div>

      {activeTab === 'income' && (
        <Income 
          stats={stats} 
          allMonths={allMonths} 
          groupedData={groupedData} 
          categories={categories} 
          showSummary={showSummary} 
          setShowSummary={setShowSummary}
          isTableHidden={isTableHidden}
        />
      )}

      {activeTab === 'expenses' && (
        <Expenses 
          stats={stats} 
          allMonths={allMonths} 
          groupedData={groupedData} 
          categories={categories} 
          showSummary={showSummary} 
          setShowSummary={setShowSummary}
          isTableHidden={isTableHidden}
        />
      )}

      {activeTab === 'saving' && (
        <Saving 
          stats={stats} 
          allMonths={allMonths} 
          groupedData={groupedData} 
          categories={categories} 
          showSummary={showSummary} 
          setShowSummary={setShowSummary}
          showProfit={showProfit}
          setShowProfit={setShowProfit}
          isTableHidden={isTableHidden}
        />
      )}

      {activeTab === 'dps' && (
        <DPS 
          stats={stats} 
          allMonths={allMonths} 
          groupedData={groupedData} 
          categories={categories} 
          showSummary={showSummary} 
          setShowSummary={setShowSummary}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          isTableHidden={isTableHidden}
        />
      )}
    </div>
  );
}
