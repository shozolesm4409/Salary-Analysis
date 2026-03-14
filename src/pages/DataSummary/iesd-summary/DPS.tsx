import React from 'react';
import { format } from 'date-fns';
import { Building2, Receipt, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DPSProps {
  stats: any;
  allMonths: string[];
  groupedData: Record<string, Record<string, number>>;
  categories: string[];
  showSummary: boolean;
  setShowSummary: (show: boolean) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  isTableHidden: (key: string) => boolean;
}

export default function DPS({ 
  stats, 
  allMonths, 
  groupedData, 
  categories, 
  showSummary, 
  setShowSummary, 
  showHistory, 
  setShowHistory,
  isTableHidden 
}: DPSProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-blue-600">DPS Overview</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-3 rounded-xl shadow-lg border border-slate-600 text-white flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">DPS-1</div>
            <div className="text-xl font-black">{stats.dps1Amount.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-lg border border-orange-400 text-white flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">DPS-2</div>
            <div className="text-xl font-black">{stats.dps2Amount.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg border border-emerald-400 text-white flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Total DPS</div>
            <div className="text-xl font-black">{stats.totalDps.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg border border-purple-400 text-white flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Total Month</div>
            <div className="text-xl font-black">{stats.dpsTotalMonths}</div>
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
            {showSummary ? 'Hide DPS Summary' : 'Show DPS Summary'}
          </button>
        )}
        {!isTableHidden('iesd_dps') && (
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
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50">SL</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50 min-w-[150px]">Name</th>
                  {allMonths.map(month => (
                    <th key={month} className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50 text-center min-w-[60px]">
                      {format(new Date(month + '-01'), 'MMM-yy')}
                    </th>
                  ))}
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 bg-slate-50">Remark</th>
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
                    <td className="px-1 py-1 text-sm border border-slate-100"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DPS History Table */}
      {showHistory && !isTableHidden('iesd_dps') && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="bg-slate-100">
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200">Month Name</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">DPS-1</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">DPS-2</th>
                  <th className="px-1 py-1 text-xs font-black text-slate-700 uppercase border border-slate-200 text-center">Total Amount</th>
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
                      <td className="px-1 py-1 text-sm font-bold border border-slate-100 text-center">
                        {format(new Date(month + '-01'), 'MMM-yy')}
                      </td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-center">{dps1 > 0 ? dps1 : ''}</td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-center">{dps2 > 0 ? dps2 : ''}</td>
                      <td className="px-1 py-1 text-sm border border-slate-100 text-center font-bold">{total}</td>
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
