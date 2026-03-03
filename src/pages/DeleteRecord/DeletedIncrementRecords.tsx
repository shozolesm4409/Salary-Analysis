import React, { useState } from 'react';
import { useIncrementRecords } from '@/hooks/useIncrementRecords';
import { useSettings } from '@/hooks/useSettings';
import { RotateCcw, Trash2, Search, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';

export default function DeletedIncrementRecords() {
  const { deletedRecords, loading, restoreRecord, permanentlyDeleteRecord, permanentlyDeleteAllRecords } = useIncrementRecords();
  const { isTableHidden, isActionHidden, isButtonHidden } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredRecords = deletedRecords.filter(r => 
    r.year.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.amount.toString().includes(searchTerm) ||
    r.remark?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = async (id: string) => {
    try {
      await restoreRecord(id);
      Swal.fire({
        icon: 'success',
        title: 'পুনরুদ্ধার সফল!',
        text: 'Record restored successfully',
        position: 'top',
        toast: true,
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'mt-4 rounded-xl shadow-lg' }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text: 'Failed to restore record',
        position: 'top',
        toast: true,
        showConfirmButton: true,
      });
    }
  };

  const handlePermanentDelete = (id: string) => {
    setRecordToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmPermanentDelete = async () => {
    if (!recordToDelete) return;
    setIsProcessing(true);
    try {
      await permanentlyDeleteRecord(recordToDelete);
      Swal.fire({
        icon: 'success',
        title: 'স্থায়ীভাবে মুছে ফেলা হয়েছে!',
        text: 'Record permanently deleted',
        position: 'top',
        toast: true,
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'mt-4 rounded-xl shadow-lg' }
      });
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text: 'Failed to delete record',
        position: 'top',
        toast: true,
        showConfirmButton: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDeleteAll = async () => {
    setIsProcessing(true);
    try {
      await permanentlyDeleteAllRecords();
      Swal.fire({
        icon: 'success',
        title: 'সব মুছে ফেলা হয়েছে!',
        text: 'All records permanently deleted',
        position: 'top',
        toast: true,
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'mt-4 rounded-xl shadow-lg' }
      });
      setIsDeleteAllModalOpen(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text: 'Failed to delete all records',
        position: 'top',
        toast: true,
        showConfirmButton: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isActionVisible = !isActionHidden('increment_deleted_action');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deleted Increment</h1>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        {!isButtonHidden('delete_all_deleted_transactions') && deletedRecords.length > 0 && (
          <button
            onClick={() => setIsDeleteAllModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All
          </button>
        )}
      </div>

      {!isTableHidden('increment_deleted') ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full text-left border-collapse sticky-header">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deleted At</th>
                  {isActionVisible && <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{r.year}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{r.amount}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{r.status}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {r.deletedAt ? new Date(r.deletedAt).toLocaleString() : '-'}
                      </td>
                      {isActionVisible && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => r.id && handleRestore(r.id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Restore"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => r.id && handlePermanentDelete(r.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Permanent Delete"
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
                    <td colSpan={isActionVisible ? 5 : 4} className="px-6 py-12 text-center text-slate-500">
                      No deleted records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Permanent Delete</h3>
              <p className="text-slate-500 mb-6">
                Are you sure you want to permanently delete this record? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPermanentDelete}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete All</h3>
              <p className="text-slate-500 mb-6">
                Are you sure you want to permanently delete ALL records? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermanentDeleteAll}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
