import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PiggyBank, 
  Calculator, 
  Settings, 
  Plus, 
  X, 
  Save, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Briefcase,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfitRecords } from '@/hooks/useProfitRecords';
import { useTransactions } from '@/hooks/useTransactions';
import { ProfitRecord } from '@/types';

interface SavingProps {
  stats: any;
  allMonths: string[];
  groupedData: Record<string, Record<string, number>>;
  categories: string[];
  showSummary: boolean;
  setShowSummary: (show: boolean) => void;
  showProfit: boolean;
  setShowProfit: (show: boolean) => void;
  isTableHidden: (key: string) => boolean;
}

export default function Saving({ 
  stats, 
  allMonths, 
  groupedData, 
  categories, 
  showSummary, 
  setShowSummary, 
  showProfit, 
  setShowProfit,
  isTableHidden 
}: SavingProps) {
  const { records: profitRecords, loading: profitLoading, addRecord, updateRecord, deleteRecord } = useProfitRecords();
  const { transactions } = useTransactions();
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ProfitRecord, 'id' | 'timestamp'>>({
    year: '',
    months: 0,
    present: 0,
    ebfAmount: 0,
    totalAmount: 0,
    yearAmount: 0,
    ebfAmounts: 0,
    m: 0,
    done: false,
    remark: ''
  });

  // Auto-calculate M and Year Amount for the form
  useEffect(() => {
    if (formData.ebfAmounts > 0) {
      const matchingTransactions = transactions.filter(t => 
        t.category === 'Saving' && 
        t.department === 'ORG' && 
        t.amount === formData.ebfAmounts
      );
      const uniqueMonths = new Set(matchingTransactions.map(t => t.month));
      const mCount = uniqueMonths.size;
      const calculatedYearAmount = formData.ebfAmounts * mCount;
      
      if (formData.m !== mCount || formData.yearAmount !== calculatedYearAmount) {
        setFormData(prev => ({
          ...prev,
          m: mCount,
          yearAmount: calculatedYearAmount
        }));
      }
    } else if (formData.ebfAmounts === 0 && (formData.m !== 0 || formData.yearAmount !== 0)) {
      setFormData(prev => ({
        ...prev,
        m: 0,
        yearAmount: 0
      }));
    }
  }, [formData.ebfAmounts, transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRecord(editingId, formData);
        setEditingId(null);
      } else {
        await addRecord({ ...formData, timestamp: Date.now() });
      }
      setIsAdding(false);
      resetForm();
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      year: '',
      months: 0,
      present: 0,
      ebfAmount: 0,
      totalAmount: 0,
      yearAmount: 0,
      ebfAmounts: 0,
      m: 0,
      done: false,
      remark: ''
    });
  };

  const handleEdit = (record: ProfitRecord) => {
    setEditingId(record.id!);
    setFormData({
      year: record.year,
      months: record.months,
      present: record.present,
      ebfAmount: record.ebfAmount,
      totalAmount: record.totalAmount,
      yearAmount: record.yearAmount,
      ebfAmounts: record.ebfAmounts,
      m: record.m,
      done: record.done,
      remark: record.remark || ''
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteRecord(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold text-blue-600">Saving Overview</h2>
        {!isTableHidden('profit_manage') && (
          <button 
            onClick={() => setIsManageOpen(true)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            title="Profit Manage"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3">
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
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-2 rounded-lg shadow-lg border border-slate-600 text-white text-center">
          <div className="text-xl font-black mb-0.5">{stats.ebfSaving.toLocaleString()}</div>
          <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
            <PiggyBank className="w-3 h-3 mr-1" /> EBF Saving
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg border border-purple-400 text-white text-center">
          <div className="text-xl font-black mb-0.5">{stats.totalEbf.toLocaleString()}</div>
          <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
            <Calculator className="w-3 h-3 mr-1" /> Total EBF
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg shadow-lg border border-amber-400 text-white text-center">
          <div className="text-xl font-black mb-0.5">{stats.runningProfit.toLocaleString()}</div>
          <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
            <TrendingUp className="w-3 h-3 mr-1" /> Running Profit
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-red-700 p-2 rounded-lg shadow-lg border border-rose-400 text-white text-center">
          <div className="text-xl font-black mb-0.5">{stats.quittingJob.toLocaleString()}</div>
          <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
            <Briefcase className="w-3 h-3 mr-1" /> Quitting a job
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg border border-cyan-400 text-white text-center">
          <div className="text-xl font-black mb-0.5">{stats.totalEDP.toLocaleString()}</div>
          <div className="flex items-center justify-center text-[10px] font-bold opacity-90 uppercase">
            <Coins className="w-3 h-3 mr-1" /> Total E.D.P
          </div>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        {!isTableHidden('iesd_summary') && (
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors text-xs sm:text-base"
          >
            {showSummary ? 'Hide Saving Summary' : 'Show Saving Summary'}
          </button>
        )}
        {!isTableHidden('iesd_profit') && (
          <button
            onClick={() => setShowProfit(!showProfit)}
            className="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors text-xs sm:text-base"
          >
            {showProfit ? 'Hide Profit' : 'Show Profit'}
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
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50">SL</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50 min-w-[150px]">Saving Type</th>
                  {allMonths.map(month => (
                    <th key={month} className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50 text-center min-w-[60px]">
                      {month && !isNaN(new Date(month + '-01').getTime()) ? format(new Date(month + '-01'), 'MMM-yy') : month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat, idx) => (
                  <tr key={cat} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-1 py-1 text-sm font-medium text-slate-500 border border-slate-100 text-center">{idx + 1}</td>
                    <td className="px-1 py-1 text-sm font-bold text-slate-800 border border-slate-100">{cat}</td>
                    {allMonths.map(month => {
                      const amount = groupedData[cat]?.[month];
                      return (
                        <td key={month} className="px-1 py-1 text-sm font-medium text-slate-600 border border-slate-100 text-right">
                          {amount ? amount.toLocaleString() : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-slate-50 font-black">
                  <td className="px-1 py-1 text-sm border border-slate-200 text-center">{categories.length + 1}</td>
                  <td className="px-1 py-1 text-sm border border-slate-200">Total</td>
                  {allMonths.map(month => {
                    const total = categories.reduce((sum, cat) => sum + (groupedData[cat]?.[month] || 0), 0);
                    return (
                      <td key={month} className="px-1 py-1 text-sm border border-slate-200 text-right">
                        {total > 0 ? total.toLocaleString() : ''}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profit Table */}
      {showProfit && !isTableHidden('iesd_profit') && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden mt-8">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="bg-slate-100">
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200">Year</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Month</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Present</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-right">EBFAmount</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-right">T.Amount</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-right">Year Amount</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-right">EBFAmounts</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Month</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Done</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profitRecords.map((row, idx) => {
                  const autoMonth = (idx + 1) * 12;
                  const presentVal = row.present > 1 ? row.present / 100 : row.present;
                  const calculatedEbfAmount = stats.ebfSaving * presentVal;
                  const calculatedTotalAmount = stats.ebfSaving + calculatedEbfAmount;
                  
                  return (
                    <tr key={row.id || idx} className="hover:bg-slate-50">
                      <td className="px-1 py-1 text-sm font-bold border border-slate-100">{row.year}</td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-center">{autoMonth}</td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-center">
                        {row.present}{row.present > 1 ? '%' : ''}
                      </td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-right font-medium text-slate-900">
                        {calculatedEbfAmount > 0 ? Math.round(calculatedEbfAmount).toLocaleString() : ''}
                      </td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-right font-medium text-slate-900">
                        {calculatedTotalAmount > 0 ? Math.round(calculatedTotalAmount).toLocaleString() : ''}
                      </td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-right">{row.yearAmount > 0 ? row.yearAmount.toLocaleString() : ''}</td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-right">{row.ebfAmounts > 0 ? row.ebfAmounts.toLocaleString() : ''}</td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-center">{row.m > 0 ? row.m : ''}</td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-center">
                        <input type="checkbox" checked={row.done} readOnly className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-1 py-1 text-sm border border-slate-100">
                        {row.done ? (
                          <span className="text-emerald-600 flex items-center font-bold">😊 সম্পন্ন হয়েছে!</span>
                        ) : (
                          <span className="text-amber-600 flex items-center font-bold">⚠️ এখনো সম্পন্ন হয়নি!</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {profitRecords.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-slate-500">No profit records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {profitRecords.length === 0 ? (
              <div className="px-4 py-10 text-center text-slate-500">No profit records found.</div>
            ) : (
              profitRecords.map((row, idx) => {
                const autoMonth = (idx + 1) * 12;
                const presentVal = row.present > 1 ? row.present / 100 : row.present;
                const calculatedEbfAmount = stats.ebfSaving * presentVal;
                const calculatedTotalAmount = stats.ebfSaving + calculatedEbfAmount;

                return (
                  <div key={row.id || idx} className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-black text-slate-800">{row.year}</div>
                      <div className="text-xs font-bold text-slate-500">Month: {autoMonth}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="text-[10px] font-black text-slate-400 uppercase">Present</div>
                        <div className="text-sm font-bold text-slate-700">{row.present}{row.present > 1 ? '%' : ''}</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="text-[10px] font-black text-slate-400 uppercase">Status</div>
                        <div className="text-xs font-bold">
                          {row.done ? (
                            <span className="text-emerald-600">😊 সম্পন্ন</span>
                          ) : (
                            <span className="text-amber-600">⚠️ অসম্পন্ন</span>
                          )}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <div className="text-[10px] font-black text-blue-400 uppercase">EBF Amount</div>
                        <div className="text-sm font-black text-blue-600">
                          {calculatedEbfAmount > 0 ? Math.round(calculatedEbfAmount).toLocaleString() : '0'}
                        </div>
                      </div>
                      <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                        <div className="text-[10px] font-black text-indigo-400 uppercase">T.Amount</div>
                        <div className="text-sm font-black text-indigo-600">
                          {calculatedTotalAmount > 0 ? Math.round(calculatedTotalAmount).toLocaleString() : '0'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase">Year Amt</div>
                        <div className="text-xs font-medium text-slate-600">{row.yearAmount > 0 ? row.yearAmount.toLocaleString() : '-'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase">EBF Amts</div>
                        <div className="text-xs font-medium text-slate-600">{row.ebfAmounts > 0 ? row.ebfAmounts.toLocaleString() : '-'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase">M</div>
                        <div className="text-xs font-medium text-slate-600">{row.m > 0 ? row.m : '-'}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Profit Manage Popup */}
      {isManageOpen && !isTableHidden('profit_manage') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Profit Manage</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAdding(!isAdding)}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg font-bold text-white transition-all shadow-md text-sm",
                    isAdding ? "bg-slate-500" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isAdding ? 'Cancel' : 'Add New Record'}
                </button>
                <button 
                  onClick={() => {
                    setIsManageOpen(false);
                    setIsAdding(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isAdding && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Year</label>
                      <input
                        type="text"
                        required
                        value={formData.year}
                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        placeholder="e.g. 1 Year+"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Present</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.present}
                        onChange={e => setFormData({ ...formData, present: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Year Amount (Auto)</label>
                      <input
                        type="number"
                        readOnly
                        value={formData.yearAmount}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">EBF Amounts</label>
                      <input
                        type="number"
                        required
                        value={formData.ebfAmounts}
                        onChange={e => setFormData({ ...formData, ebfAmounts: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        placeholder="Enter amount to match"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">M (Auto Count)</label>
                      <input
                        type="number"
                        readOnly
                        value={formData.m}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Remark</label>
                      <input
                        type="text"
                        value={formData.remark}
                        onChange={e => setFormData({ ...formData, remark: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="done"
                        checked={formData.done}
                        onChange={e => setFormData({ ...formData, done: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="done" className="text-sm font-bold text-slate-700">Mark as Done</label>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdding(false);
                          setEditingId(null);
                          resetForm();
                        }}
                        className="px-6 py-2 bg-white text-slate-700 font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {editingId ? 'Update Record' : 'Save Record'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200">Year</th>
                        <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Months</th>
                        <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Present</th>
                        <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-right">EBF Amount</th>
                        <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-right">Total Amount</th>
                        <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Done</th>
                        <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profitRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-slate-500 font-medium">
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        profitRecords.map((record, idx) => {
                          const autoMonth = (idx + 1) * 12;
                          const presentVal = record.present > 1 ? record.present / 100 : record.present;
                          const calculatedEbfAmount = stats.ebfSaving * presentVal;
                          const calculatedTotalAmount = stats.ebfSaving + calculatedEbfAmount;

                          return (
                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-1 py-1 text-sm font-bold border border-slate-100">{record.year}</td>
                              <td className="px-1 py-1 text-sm border border-slate-100 text-center">{autoMonth}</td>
                              <td className="px-1 py-1 text-sm border border-slate-100 text-center">
                                {record.present}{record.present > 1 ? '%' : ''}
                              </td>
                              <td className="px-1 py-1 text-sm border border-slate-100 text-right font-medium">
                                {calculatedEbfAmount > 0 ? Math.round(calculatedEbfAmount).toLocaleString() : ''}
                              </td>
                              <td className="px-1 py-1 text-sm border border-slate-100 text-right font-medium">
                                {calculatedTotalAmount > 0 ? Math.round(calculatedTotalAmount).toLocaleString() : ''}
                              </td>
                              <td className="px-1 py-1 text-sm border border-slate-100 text-center">
                                {record.done ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                                )}
                              </td>
                              <td className="px-1 py-1 text-sm border border-slate-100 text-center">
                                <div className="flex justify-center space-x-2">
                                  <button
                                    onClick={() => handleEdit(record)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(record.id!)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                  {profitRecords.length === 0 ? (
                    <div className="px-4 py-10 text-center text-slate-500 font-medium">
                      No records found.
                    </div>
                  ) : (
                    profitRecords.map((record, idx) => {
                      const autoMonth = (idx + 1) * 12;
                      const presentVal = record.present > 1 ? record.present / 100 : record.present;
                      const calculatedEbfAmount = stats.ebfSaving * presentVal;
                      const calculatedTotalAmount = stats.ebfSaving + calculatedEbfAmount;

                      return (
                        <div key={record.id} className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-black text-slate-800">{record.year}</div>
                              <div className="text-xs text-slate-500">Months: {autoMonth}</div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id!)}
                                className="p-2 text-red-600 bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="text-[10px] font-black text-slate-400 uppercase">Present</div>
                              <div className="text-sm font-bold text-slate-700">
                                {record.present}{record.present > 1 ? '%' : ''}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[10px] font-black text-slate-400 uppercase">Status</div>
                              <div className="flex items-center">
                                {record.done ? (
                                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-amber-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" /> Pending
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[10px] font-black text-slate-400 uppercase">EBF Amount</div>
                              <div className="text-sm font-black text-blue-600">
                                {calculatedEbfAmount > 0 ? Math.round(calculatedEbfAmount).toLocaleString() : '0'}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[10px] font-black text-slate-400 uppercase">Total Amount</div>
                              <div className="text-sm font-black text-indigo-600">
                                {calculatedTotalAmount > 0 ? Math.round(calculatedTotalAmount).toLocaleString() : '0'}
                              </div>
                            </div>
                          </div>
                          {record.remark && (
                            <div className="pt-2 border-t border-slate-50">
                              <div className="text-[10px] font-black text-slate-400 uppercase">Remark</div>
                              <div className="text-xs text-slate-600 italic">{record.remark}</div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
