import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettings } from '@/hooks/useSettings';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  EyeOff
} from 'lucide-react';
import TransactionForm from '@/components/TransactionForm';

export default function Transactions() {
  const { transactions, loading, error, deleteTransaction, deleteAllTransactions } = useTransactions();
  const { isTableHidden, isButtonHidden, isActionHidden } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isTypeUnlocked, setIsTypeUnlocked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get available years from transactions
  const availableYears = Array.from(new Set(transactions.map(t => t.month.split('-')[0]))).sort((a, b) => (b as string).localeCompare(a as string));

  // Get available months for the selected year from database
  const availableMonths = Array.from(new Set(
    transactions
      .filter(t => filterYear === 'all' || t.month.startsWith(filterYear))
      .map(t => t.month)
  )).sort((a, b) => (b as string).localeCompare(a as string));

  // Get available categories based on type
  const availableCategories = Array.from(new Set(
    transactions
      .filter(t => filterType === 'all' || t.type === filterType)
      .map(t => t.category)
  )).sort();

  // Filtering Logic
  const filteredTransactions = transactions.filter(t => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return (
      (filterType === 'all' || t.type === filterType) &&
      (filterCategory === 'all' || t.category === filterCategory) &&
      (filterYear === 'all' || t.month.startsWith(filterYear)) &&
      (filterMonth === 'all' || t.month === filterMonth)
    );

    const searchWords = searchLower.split(/[,\s]+/).filter(word => word.length > 0);
    
    const matchesSearch = searchWords.every(word => 
      t.category.toLowerCase().includes(word) ||
      t.department.toLowerCase().includes(word) ||
      t.description?.toLowerCase().includes(word) ||
      t.type.toLowerCase().includes(word) ||
      t.amount.toString().includes(word) ||
      format(new Date(t.date), 'dd MMM yyyy').toLowerCase().includes(word)
    );
    
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesYear = filterYear === 'all' || t.month.startsWith(filterYear);
    const matchesMonth = filterMonth === 'all' || t.month === filterMonth;

    return matchesSearch && matchesType && matchesCategory && matchesYear && matchesMonth;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleConfirmDeleteAll = async () => {
    await deleteAllTransactions();
    setIsDeleteAllModalOpen(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeOff className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
              <input 
                type="checkbox" 
                checked={isTypeUnlocked}
                onChange={(e) => setIsTypeUnlocked(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                title="Unlock Income/Expense type in edit mode"
              />
            </div>
            <p className="text-slate-500">Manage your income and expenses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isButtonHidden('delete_all_transactions') && transactions.length > 0 && (
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete All
            </button>
          )}
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3">
        {/* Row 1: Search and Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setFilterCategory('all'); // Reset category when type changes
              }}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Year and Month */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setFilterMonth('all'); // Reset month when year changes
            }}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            disabled={filterYear === 'all'}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 text-sm"
          >
            <option value="all">All Months</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {format(new Date(month + '-01'), 'MMMM yyyy')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      {!isTableHidden('transactions') ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-left border-collapse sticky-header px-2 py-1">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">SL</th>
                  <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  {!isActionHidden('transactions_action') && <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((t, index) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 py-1 text-sm text-slate-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-2 py-1 text-sm text-slate-900 font-medium">
                        {format(new Date(t.date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-2 py-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          t.type === 'income' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-2 py-1 text-sm text-slate-700">{t.category}</td>
                      <td className="px-2 py-1 text-sm text-slate-700">{t.department}</td>
                      <td className={`px-2 py-1 text-sm font-bold text-right ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                      </td>
                      {!isActionHidden('transactions_action') && (
                        <td className="px-2 py-1 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(t)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (t.id) {
                                  handleDelete(t.id);
                                } else {
                                  console.error("Transaction ID is missing", t);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No transactions found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of{' '}
                <span className="font-medium">{filteredTransactions.length}</span> results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EyeOff className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Table Hidden</h3>
          <p className="text-slate-500">This table has been hidden from settings.</p>
        </div>
      )}

      {isFormOpen && (
        <TransactionForm 
          onClose={() => setIsFormOpen(false)} 
          initialData={editingTransaction}
          isTypeUnlocked={isTypeUnlocked}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">মুছে ফেলার নিশ্চিতকরণ</h3>
              <p className="text-slate-500 mb-6">
                আপনি কি নিশ্চিত যে আপনি এই লেনদেনটি মুছে ফেলতে চান? এটি "Deleted Transactions" এ স্থানান্তরিত হবে এবং পরে পুনরুদ্ধার করা যাবে।
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  মুছে ফেলুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete All Confirmation Modal */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">সব মুছে ফেলার নিশ্চিতকরণ</h3>
              <p className="text-slate-500 mb-6">
                আপনি কি নিশ্চিত যে আপনি সব লেনদেন মুছে ফেলতে চান? এটি "Deleted Transactions" এ স্থানান্তরিত হবে এবং পরে পুনরুদ্ধার করা যাবে।
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleConfirmDeleteAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  সব মুছুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
