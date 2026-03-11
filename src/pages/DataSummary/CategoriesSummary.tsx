import React, { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { Eye, X, FileText } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface CategorySummaryRow {
  id: string; // unique id for the row (category + type)
  category: string;
  type: 'income' | 'expense';
  amount: number;
  transactions: Transaction[];
}

export default function CategoriesSummary() {
  const { transactions, loading } = useTransactions();
  const { isTableHidden, isActionHidden } = useSettings();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');

  const categoryData = useMemo(() => {
    const grouped = transactions.reduce((acc, curr) => {
      const key = `${curr.category}_${curr.type}`;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          category: curr.category,
          type: curr.type,
          amount: 0,
          transactions: [],
        };
      }
      
      acc[key].amount += curr.amount;
      acc[key].transactions.push(curr);
      
      return acc;
    }, {} as Record<string, CategorySummaryRow>);

    return (Object.values(grouped) as CategorySummaryRow[]).sort((a, b) => {
      // Sort by type first (income then expense), then by category name
      if (a.type !== b.type) {
        return a.type === 'income' ? -1 : 1;
      }
      return a.category.localeCompare(b.category);
    });
  }, [transactions]);

  const selectedRow = categoryData.find(r => r.id === selectedRowId);

  const filteredCategoryData = categoryData.filter(row => row.type === activeTab);

  const handleViewDetails = (id: string) => {
    setSelectedRowId(id);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories Summary</h1>
          <p className="text-slate-500">View total amounts grouped by category</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100/80 p-1 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'income'
              ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'expense'
              ? 'bg-white text-red-600 shadow-sm ring-1 ring-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Expense
        </button>
      </div>

      {/* Data Table */}
      {!isTableHidden('categories_summary') && (
        <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-sm md:border md:border-slate-100 overflow-hidden flex flex-col">
          <div className="overflow-x-hidden md:overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-[70vh] p-2 md:p-0">
            <table className="w-full text-left border-collapse block md:table">
              <thead className="hidden md:table-header-group sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-sm">
                <tr className="md:table-row">
                  <th className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">SL</th>
                  <th className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  {!isActionHidden('categories_summary_action') && (
                    <th className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">View Details</th>
                  )}
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {filteredCategoryData.length > 0 ? (
                  filteredCategoryData.map((row, index) => (
                    <tr key={row.id} className="block md:table-row bg-white mb-4 md:mb-0 border border-slate-200 md:border-none rounded-xl md:rounded-none shadow-sm md:shadow-none hover:bg-slate-50 transition-colors">
                      {/* Mobile View */}
                      <td className="md:hidden block p-4">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-500">SL {index + 1}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                              row.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {row.type}
                            </span>
                          </div>
                          {!isActionHidden('categories_summary_action') && (
                            <button
                              onClick={() => handleViewDetails(row.id)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-medium text-slate-600 mb-1">Category</p>
                            <p className="text-base font-bold text-slate-900 capitalize">{row.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-slate-600 mb-1">Total Amount</p>
                            <p className={`text-lg font-bold ${row.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {row.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Desktop View */}
                      <td className="hidden md:table-cell px-4 py-1 text-sm text-slate-500 border-b border-slate-100">
                        {index + 1}
                      </td>
                      <td className="hidden md:table-cell px-4 py-1 border-b border-slate-100">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          row.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-1 text-sm font-medium text-slate-900 capitalize border-b border-slate-100">
                        {row.category}
                      </td>
                      <td className={`hidden md:table-cell px-4 py-1 text-sm font-bold text-right border-b border-slate-100 ${
                        row.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {row.amount.toLocaleString()}
                      </td>
                      {!isActionHidden('categories_summary_action') && (
                        <td className="hidden md:table-cell px-4 py-1 text-center border-b border-slate-100">
                          <button
                            onClick={() => handleViewDetails(row.id)}
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
                    <td colSpan={5} className="block md:table-cell px-6 py-12 text-center text-slate-500 bg-white rounded-xl md:rounded-none border border-slate-200 md:border-none">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-800 capitalize">
                  Transactions: {selectedRow.category}
                </h2>
                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                  selectedRow.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedRow.type}
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <div className={`p-4 rounded-xl border text-center flex flex-col justify-center items-center ${
                  selectedRow.type === 'income' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                }`}>
                  <p className={`text-sm font-medium mb-1 ${
                    selectedRow.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    Total Amount
                  </p>
                  <p className={`text-2xl font-bold ${
                    selectedRow.type === 'income' ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {selectedRow.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-transparent md:bg-white md:border md:border-slate-200 md:rounded-lg overflow-hidden flex flex-col">
                <div className="overflow-x-hidden md:overflow-x-auto overflow-y-auto max-h-[40vh] md:max-h-[50vh] p-2 md:p-0">
                  <table className="w-full text-left text-sm block md:table">
                    <thead className="hidden md:table-header-group sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-sm">
                      <tr className="md:table-row">
                        <th className="px-4 py-1 font-semibold text-slate-600">Date</th>
                        <th className="px-4 py-1 font-semibold text-slate-600">Department</th>
                        <th className="px-4 py-1 font-semibold text-slate-600">Description</th>
                        <th className="px-4 py-1 font-semibold text-slate-600 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="block md:table-row-group">
                      {selectedRow.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                        <tr key={t.id} className="block md:table-row bg-white mb-3 md:mb-0 border border-slate-200 md:border-none rounded-xl md:rounded-none shadow-sm md:shadow-none hover:bg-slate-50 transition-colors">
                          {/* Mobile View */}
                          <td className="md:hidden block px-4 py-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-slate-500">{format(new Date(t.date), 'dd MMM yyyy')}</span>
                              <span className="text-sm font-bold text-slate-900 text-right">{t.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-slate-700">{t.department}</span>
                              {t.description && <span className="text-xs text-slate-500">{t.description}</span>}
                            </div>
                          </td>
                          
                          {/* Desktop View */}
                          <td className="hidden md:table-cell px-4 py-1 text-slate-600 whitespace-nowrap border-b border-slate-100">
                            {format(new Date(t.date), 'dd MMM yyyy')}
                          </td>
                          <td className="hidden md:table-cell px-4 py-1 text-slate-700 whitespace-nowrap border-b border-slate-100">
                            {t.department}
                          </td>
                          <td className="hidden md:table-cell px-4 py-1 text-slate-500 border-b border-slate-100 max-w-xs truncate" title={t.description}>
                            {t.description || '-'}
                          </td>
                          <td className="hidden md:table-cell px-4 py-1 text-right font-bold text-slate-700 whitespace-nowrap border-b border-slate-100">
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
