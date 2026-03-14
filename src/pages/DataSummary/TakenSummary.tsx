import React, { useState, useMemo, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { Eye, X, FileText, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SummaryRow {
  department: string;
  amount1: number; // Taken or lend
  amount2: number; // Given or give back
  due: number;
  status: string;
  transactions: Transaction[];
}

export default function TakenSummary() {
  const { transactions, loading: txLoading } = useTransactions();
  const { isTableHidden, isActionHidden, loading: settingsLoading } = useSettings();
  const [activeTab, setActiveTab] = useState<'taken_given' | 'lend_give_back'>('taken_given');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isTakenGivenHidden = isTableHidden('taken_given');
  const isLendGiveBackHidden = isTableHidden('lend_give_back');

  useEffect(() => {
    if (isTakenGivenHidden && !isLendGiveBackHidden) {
      setActiveTab('lend_give_back');
    } else if (!isTakenGivenHidden && isLendGiveBackHidden) {
      setActiveTab('taken_given');
    }
  }, [isTakenGivenHidden, isLendGiveBackHidden]);

  // Process data for Taken & Given
  const takenGivenData = useMemo(() => {
    const filtered = transactions.filter(
      t => t.category.toLowerCase() === 'taken' || t.category.toLowerCase() === 'given'
    );
    
    const grouped = filtered.reduce((acc, curr) => {
      const dept = curr.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { department: dept, amount1: 0, amount2: 0, due: 0, status: '', transactions: [] };
      }
      
      if (curr.category.toLowerCase() === 'taken') {
        acc[dept].amount1 += curr.amount;
      } else if (curr.category.toLowerCase() === 'given') {
        acc[dept].amount2 += curr.amount;
      }
      
      acc[dept].transactions.push(curr);
      return acc;
    }, {} as Record<string, SummaryRow>);

    return (Object.values(grouped) as SummaryRow[]).map(row => {
      row.due = row.amount1 - row.amount2;
      row.status = row.due === 0 ? 'Settled' : 'Pending';
      return row;
    }).sort((a, b) => a.department.localeCompare(b.department));
  }, [transactions]);

  // Process data for Lend & Give Back
  const lendGiveBackData = useMemo(() => {
    const filtered = transactions.filter(
      t => t.category.toLowerCase() === 'lend' || t.category.toLowerCase() === 'give back'
    );
    
    const grouped = filtered.reduce((acc, curr) => {
      const dept = curr.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { department: dept, amount1: 0, amount2: 0, due: 0, status: '', transactions: [] };
      }
      
      if (curr.category.toLowerCase() === 'lend') {
        acc[dept].amount1 += curr.amount;
      } else if (curr.category.toLowerCase() === 'give back') {
        acc[dept].amount2 += curr.amount;
      }
      
      acc[dept].transactions.push(curr);
      return acc;
    }, {} as Record<string, SummaryRow>);

    return (Object.values(grouped) as SummaryRow[]).map(row => {
      row.due = row.amount1 - row.amount2;
      row.status = row.due === 0 ? 'Settled' : 'Pending';
      return row;
    }).sort((a, b) => a.department.localeCompare(b.department));
  }, [transactions]);

  const currentData = activeTab === 'taken_given' ? takenGivenData : lendGiveBackData;
  const selectedRow = currentData.find(r => r.department === selectedDepartment);

  const totalTaken = takenGivenData.reduce((sum, row) => sum + row.amount1, 0);
  const totalGiven = takenGivenData.reduce((sum, row) => sum + row.amount2, 0);
  const totalTakenDue = takenGivenData.reduce((sum, row) => sum + row.due, 0);

  const totalLend = lendGiveBackData.reduce((sum, row) => sum + row.amount1, 0);
  const totalGiveBack = lendGiveBackData.reduce((sum, row) => sum + row.amount2, 0);
  const totalLendDue = lendGiveBackData.reduce((sum, row) => sum + row.due, 0);

  const handleViewDetails = (department: string) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  if (txLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isTakenGivenHidden && isLendGiveBackHidden) {
    return (
      <div className="space-y-3 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Taken Summary</h1>
            <p className="text-slate-500">Manage Taken/Given and Lend/Give Back records</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <p className="text-slate-500">All tables are currently hidden. You can enable them in Settings &amp; Management &gt; Tables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-6xl mx-auto">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Taken Summary</h1>
          <p className="text-slate-500 text-sm sm:text-base">Manage Taken/Given and Lend/Give Back records</p>
        </div>
        <Link 
          to="/dashboard" 
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group shrink-0"
          title="Overview"
        >
          <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {activeTab === 'taken_given' ? (
          <>
            <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02] text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-100 uppercase tracking-tight">Total Taken</p>
                <p className="text-lg font-black leading-none mt-1">{takenGivenData.length}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02] text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-50 uppercase tracking-tight">Taken Amount</p>
                <p className="text-lg font-black leading-none mt-1">{totalTaken.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02] text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                <ArrowDownRight className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-blue-50 uppercase tracking-tight">Total Given</p>
                <p className="text-lg font-black leading-none mt-1">{totalGiven.toLocaleString()}</p>
              </div>
            </div>

            <div className={cn(
              "p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02] text-white",
              totalTakenDue > 0 ? "bg-gradient-to-br from-rose-500 to-pink-600" : totalTakenDue < 0 ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-slate-600 to-slate-700"
            )}>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-white/90 uppercase tracking-tight">Taken Due</p>
                <p className="text-lg font-black leading-none mt-1">{totalTakenDue.toLocaleString()}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02] text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-100 uppercase tracking-tight">Total Lend</p>
                <p className="text-lg font-black leading-none mt-1">{lendGiveBackData.length}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02] text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-50 uppercase tracking-tight">Lend Amount</p>
                <p className="text-lg font-black leading-none mt-1">{totalLend.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02] text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-blue-50 uppercase tracking-tight">Total Give Back</p>
                <p className="text-lg font-black leading-none mt-1">{totalGiveBack.toLocaleString()}</p>
              </div>
            </div>

            <div className={cn(
              "p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02] text-white",
              totalLendDue > 0 ? "bg-gradient-to-br from-rose-500 to-pink-600" : totalLendDue < 0 ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-slate-600 to-slate-700"
            )}>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-white/90 uppercase tracking-tight">Lend Due</p>
                <p className="text-lg font-black leading-none mt-1">{totalLendDue.toLocaleString()}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {!isTakenGivenHidden && (
          <button
            onClick={() => setActiveTab('taken_given')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'taken_given' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Taken & Given
          </button>
        )}
        {!isLendGiveBackHidden && (
          <button
            onClick={() => setActiveTab('lend_give_back')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'lend_give_back' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Lend & Give Back
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-sm md:border md:border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-hidden md:overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-[70vh] p-2 md:p-0">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-sm">
              <tr className="md:table-row">
                <th className="px-4 py-.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">SL</th>
                <th className="px-4 py-.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  {activeTab === 'taken_given' ? 'Taken' : 'Lend'}
                </th>
                <th className="px-4 py-.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  {activeTab === 'taken_given' ? 'Given' : 'Give Back'}
                </th>
                <th className="px-4 py-.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Due</th>
                <th className="px-4 py-.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                {!isActionHidden('taken_summary_action') && (
                  <th className="px-4 py-.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">View Details</th>
                )}
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {currentData.length > 0 ? (
                currentData.map((row, index) => (
                  <tr key={row.department} className="block md:table-row bg-white mb-4 md:mb-0 border border-slate-200 md:border-none rounded-xl md:rounded-none shadow-sm md:shadow-none hover:bg-slate-50 transition-colors">
                    {/* Mobile View */}
                    <td className="md:hidden block p-4">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-500">SL {index + 1}</span>
                          <span className="text-base font-bold text-slate-900">{row.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                            row.status === 'Settled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {row.status}
                          </span>
                          {!isActionHidden('taken_summary_action') && (
                            <button
                              onClick={() => handleViewDetails(row.department)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs font-medium text-slate-600 mb-1">{activeTab === 'taken_given' ? 'Taken' : 'Lend'}</p>
                          <p className="text-sm font-bold text-emerald-600">{row.amount1.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600 mb-1">{activeTab === 'taken_given' ? 'Given' : 'Give Back'}</p>
                          <p className="text-sm font-bold text-blue-600">{row.amount2.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600 mb-1">Due</p>
                          <p className={`text-sm font-bold ${row.due > 0 ? 'text-red-600' : row.due < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {row.due.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Desktop View */}
                    <td className="hidden md:table-cell px-4 py-.5 text-sm text-slate-500 border-b border-slate-100">
                      {index + 1}
                    </td>
                    <td className="hidden md:table-cell px-4 py-.5 text-sm font-medium text-slate-900 border-b border-slate-100">
                      {row.department}
                    </td>
                    <td className="hidden md:table-cell px-4 py-.5 text-sm font-bold text-emerald-600 text-right border-b border-slate-100">
                      {row.amount1.toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell px-4 py-.5 text-sm font-bold text-blue-600 text-right border-b border-slate-100">
                      {row.amount2.toLocaleString()}
                    </td>
                    <td className={`hidden md:table-cell px-4 py-.5 text-sm font-bold text-right border-b border-slate-100 ${row.due > 0 ? 'text-red-600' : row.due < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {row.due.toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell px-4 py-.5 text-center border-b border-slate-100">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.status === 'Settled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    {!isActionHidden('taken_summary_action') && (
                      <td className="hidden md:table-cell px-4 py-.5 text-center border-b border-slate-100">
                        <button
                          onClick={() => handleViewDetails(row.department)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-flex items-center justify-center"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr className="block md:table-row">
                  <td colSpan={7} className="block md:table-cell px-6 py-12 text-center text-slate-500 bg-white rounded-xl md:rounded-none border border-slate-200 md:border-none">
                    No records found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Transactions: {selectedRow.department}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 md:p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-3 text-white">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hidden md:block">
                    {activeTab === 'taken_given' ? <ArrowUpRight className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[8px] md:text-[10px] font-bold text-emerald-50 uppercase tracking-tight">
                      {activeTab === 'taken_given' ? 'Total Taken' : 'Total Lend'}
                    </p>
                    <p className="text-xs md:text-xl font-black leading-none mt-0.5 md:mt-1">{selectedRow.amount1.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 md:p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-3 text-white">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hidden md:block">
                    {activeTab === 'taken_given' ? <ArrowDownRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[8px] md:text-[10px] font-bold text-blue-50 uppercase tracking-tight">
                      {activeTab === 'taken_given' ? 'Total Given' : 'Total Give Back'}
                    </p>
                    <p className="text-xs md:text-xl font-black leading-none mt-0.5 md:mt-1">{selectedRow.amount2.toLocaleString()}</p>
                  </div>
                </div>

                <div className={cn(
                  "p-2 md:p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-3 text-white",
                  selectedRow.due > 0 ? "bg-gradient-to-br from-rose-500 to-pink-600" : selectedRow.due < 0 ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-slate-600 to-slate-700"
                )}>
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hidden md:block">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[8px] md:text-[10px] font-bold text-white/90 uppercase tracking-tight">Total Due</p>
                    <p className="text-xs md:text-xl font-black leading-none mt-0.5 md:mt-1">{selectedRow.due.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-transparent md:bg-white md:border md:border-slate-200 md:rounded-lg overflow-hidden flex flex-col">
                <div className="overflow-x-hidden md:overflow-x-auto overflow-y-auto max-h-[40vh] md:max-h-[50vh] p-2 md:p-0">
                  <table className="w-full text-left text-sm block md:table">
                    <thead className="hidden md:table-header-group sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-sm">
                      <tr className="md:table-row">
                        <th className="px-4 py-.5 font-semibold text-slate-600">Date</th>
                        <th className="px-4 py-.5 font-semibold text-slate-600">Category</th>
                        <th className="px-4 py-.5 font-semibold text-slate-600">Type</th>
                        <th className="px-4 py-.5 font-semibold text-slate-600">Department</th>
                        <th className="px-4 py-.5 font-semibold text-slate-600 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="block md:table-row-group">
                      {selectedRow.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                        <tr key={t.id} className="block md:table-row bg-white mb-3 md:mb-0 border border-slate-200 md:border-none rounded-xl md:rounded-none shadow-sm md:shadow-none hover:bg-slate-50 transition-colors">
                          {/* Mobile View */}
                          <td className="md:hidden block px-4 py-.5">
                            <div className="flex justify-between items-center mb-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                                t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {t.type}
                              </span>
                              <span className="text-sm text-slate-500">{t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center">
                              <span className="text-sm font-medium text-slate-700 text-left truncate pr-2">{t.department}</span>
                              <span className="text-sm font-bold text-slate-900 capitalize text-center">{t.category}</span>
                              <span className="text-sm font-bold text-slate-900 text-right">{t.amount.toLocaleString()}</span>
                            </div>
                          </td>
                          
                          {/* Desktop View */}
                          <td className="hidden md:table-cell px-4 py-.5 text-slate-600 whitespace-nowrap border-b border-slate-100">
                            {t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}
                          </td>
                          <td className="hidden md:table-cell px-4 py-.5 font-medium capitalize whitespace-nowrap border-b border-slate-100">
                            {t.category}
                          </td>
                          <td className="hidden md:table-cell px-4 py-.5 whitespace-nowrap border-b border-slate-100">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                              t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="hidden md:table-cell px-4 py-.5 text-slate-600 whitespace-nowrap border-b border-slate-100">
                            {t.department}
                          </td>
                          <td className="hidden md:table-cell px-4 py-.5 text-right font-bold text-slate-700 whitespace-nowrap border-b border-slate-100">
                            {t.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
