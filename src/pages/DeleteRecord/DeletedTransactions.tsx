import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettings } from '@/hooks/useSettings';
import { format } from 'date-fns';
import { 
  RotateCcw, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  History,
  EyeOff
} from 'lucide-react';

export default function DeletedTransactions() {
  const { 
    deletedTransactions, 
    loading, 
    error,
    restoreTransaction, 
    permanentlyDeleteTransaction,
    permanentlyDeleteAllTransactions 
  } = useTransactions();
  const { isTableHidden, isButtonHidden, isActionHidden } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const filteredTransactions = deletedTransactions.filter(t => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;

    const searchWords = searchLower.split(/[,\s]+/).filter(word => word.length > 0);
    
    const matchesSearch = searchWords.every(word => 
      t.category.toLowerCase().includes(word) ||
      t.department.toLowerCase().includes(word) ||
      t.description?.toLowerCase().includes(word) ||
      t.type.toLowerCase().includes(word) ||
      t.amount.toString().includes(word) ||
      format(new Date(t.date), 'dd MMM yyyy').toLowerCase().includes(word)
    );
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRestore = async (id: string) => {
    if (confirm('আপনি কি এই লেনদেনটি পুনরুদ্ধার করতে চান?')) {
      await restoreTransaction(id);
    }
  };

  const handlePermanentDelete = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmPermanentDelete = async () => {
    if (transactionToDelete) {
      try {
        await permanentlyDeleteTransaction(transactionToDelete);
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
      } catch (error) {
        alert('লেনদেনটি মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    }
  };

  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handlePermanentDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await permanentlyDeleteAllTransactions();
      setIsDeleteAllModalOpen(false);
    } catch (error) {
      alert('সব লেনদেন মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsDeletingAll(false);
    }
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deleted Transactions</h1>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="লেনদেন খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        {!isButtonHidden('delete_all_deleted_transactions') && deletedTransactions.length > 0 && (
          <button
            onClick={() => setIsDeleteAllModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            সব মুছুন (Delete All)
          </button>
        )}
      </div>

      {!isTableHidden('deleted_transactions') ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse px-2 py-1">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">তারিখ</th>
                  <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">ধরণ</th>
                  <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">ক্যাটাগরি</th>
                  <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">ডিপার্টমেন্ট</th>
                  <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">পরিমাণ</th>
                  {!isActionHidden('deleted_transactions_action') && <th className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">অ্যাকশন</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
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
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                      </td>
                      {!isActionHidden('deleted_transactions_action') && (
                        <td className="px-2 py-1 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => t.id && handleRestore(t.id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="পুনরুদ্ধার করুন"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => t.id && handlePermanentDelete(t.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="স্থায়ীভাবে মুছুন"
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
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      কোনো মুছে ফেলা লেনদেন পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-medium">{filteredTransactions.length}</span> টি ফলাফলের মধ্যে <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> থেকে{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> দেখাচ্ছে
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
          <h3 className="text-lg font-bold text-slate-900">টেবিলটি লুকানো আছে</h3>
          <p className="text-slate-500">সেটিংস থেকে এই টেবিলটি লুকানো হয়েছে।</p>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">স্থায়ীভাবে মুছে ফেলুন</h3>
              <p className="text-slate-500 mb-6">
                আপনি কি নিশ্চিত যে আপনি এই লেনদেনটি স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmPermanentDelete}
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">সব মুছে ফেলুন</h3>
              <p className="text-slate-500 mb-6">
                আপনি কি নিশ্চিত যে আপনি সব লেনদেন স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={handlePermanentDeleteAll}
                  disabled={isDeletingAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingAll ? `${deletedTransactions.length} টি মুছে ফেলা হচ্ছে...` : 'সব মুছুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
