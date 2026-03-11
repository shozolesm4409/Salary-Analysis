import React, { useState } from 'react';
import { useIncrementRecords, IncrementRecord } from '@/hooks/useIncrementRecords';
import { useSettings } from '@/hooks/useSettings';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';

export default function IncrementRecordPage() {
  const { records, loading, addRecord, updateRecord, deleteRecord } = useIncrementRecords();
  const { isActionHidden, isTableHidden } = useSettings();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IncrementRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    year: '',
    amount: '',
    startDate: '',
    endDate: '',
    status: 'Completed' as IncrementRecord['status'],
    remark: ''
  });

  const handleOpenModal = (record?: IncrementRecord) => {
    if (record) {
      setCurrentRecord(record);
      setFormData({
        year: record.year,
        amount: record.amount.toString(),
        startDate: record.startDate,
        endDate: record.endDate,
        status: record.status,
        remark: record.remark || ''
      });
    } else {
      setCurrentRecord(null);
      setFormData({
        year: '',
        amount: '',
        startDate: '',
        endDate: '',
        status: 'Completed',
        remark: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRecord(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const recordData = {
        year: formData.year,
        amount: Number(formData.amount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        remark: formData.remark
      };

      if (currentRecord) {
        await updateRecord(currentRecord.id, recordData);
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'Record updated successfully',
          position: 'top',
          toast: true,
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'mt-4 rounded-xl shadow-lg' }
        });
      } else {
        await addRecord(recordData);
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'Record added successfully',
          position: 'top',
          toast: true,
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'mt-4 rounded-xl shadow-lg' }
        });
      }
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text: 'Something went wrong',
        position: 'top',
        toast: true,
        showConfirmButton: true,
        customClass: { popup: 'mt-4 rounded-xl shadow-lg' }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRecord(recordToDelete);
      Swal.fire({
        icon: 'success',
        title: 'মুছে ফেলা হয়েছে!',
        text: 'Record deleted successfully',
        position: 'top',
        toast: true,
        timer: 1800,
        showConfirmButton: false,
        customClass: { popup: 'mt-4 rounded-xl shadow-lg' }
      });
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'মুছে ফেলতে ব্যর্থ!',
        text: 'Failed to delete record',
        position: 'top',
        toast: true,
        showConfirmButton: true,
        customClass: { popup: 'mt-4 rounded-xl shadow-lg' }
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-[#6f42c1] text-white';
      case 'Active': return 'bg-green-600 text-white';
      case 'Inactive': return 'bg-red-600 text-white';
      default: return 'bg-yellow-500 text-white';
    }
  };

  const isActionVisible = !isActionHidden('increment_record_action');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[1400px] p-0 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white md:bg-transparent p-4 md:p-0 rounded-xl shadow-sm md:shadow-none">
        <h2 className="text-xl md:text-2xl font-bold text-blue-600 md:text-slate-800 flex items-center">
          <span className="md:hidden mr-2"><i className="fas fa-money-bill-wave"></i></span>
          Increment Record
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-2">
        {/* Desktop Table */}
        {!isTableHidden('increment_record') ? (
          <div className="hidden md:block overflow-x-auto max-h-[70vh]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-white uppercase bg-blue-600 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-1.5 text-center">SL</th>
                  <th className="px-3 py-1.5 text-center">Timestamp</th>
                  <th className="px-3 py-1.5 text-center">Year</th>
                  <th className="px-3 py-1.5 text-center">Amount</th>
                  <th className="px-3 py-1.5 text-center">Start Date</th>
                  <th className="px-3 py-1.5 text-center">End Date</th>
                  <th className="px-3 py-1.5 text-center">Status</th>
                  <th className="px-3 py-1.5 text-center">Remark</th>
                  {isActionVisible && <th className="px-3 py-1.5 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={isActionVisible ? 9 : 8} className="px-6 py-8 text-center text-slate-500">
                      কোনো রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  records.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 py-1 text-center font-medium text-slate-900">{row.sl}</td>
                      <td className="px-2 py-1 text-center text-slate-600">
                        {row.timestamp?.seconds ? new Date(row.timestamp.seconds * 1000).toLocaleString() : '-'}
                      </td>
                      <td className="px-2 py-1 text-center text-slate-600">{row.year}</td>
                      <td className="px-2 py-1 text-center text-slate-600">{row.amount}</td>
                      <td className="px-2 py-1 text-center text-slate-600">{row.startDate}</td>
                      <td className="px-2 py-1 text-center text-slate-600">{row.endDate}</td>
                      <td className="px-2 py-1 text-center">
                        <span className={cn("px-2.5 py-0.5 rounded text-xs font-medium", getStatusBadgeClass(row.status))}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-2 py-1 text-center text-slate-600">{row.remark || '-'}</td>
                      {isActionVisible && (
                        <td className="px-2 py-1 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => handleOpenModal(row)}
                              className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-transform"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(row.id)}
                              className="text-red-600 hover:text-red-800 hover:scale-110 transition-transform"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 italic hidden md:block">
            This table is hidden by administrator settings.
          </div>
        )}

        {/* Mobile Table */}
        <div className="md:hidden">
          {!isTableHidden('increment_record') ? (
            <div className="overflow-y-auto max-h-[70vh]">
              <table className="w-full text-sm">
                <thead className="text-xs text-white uppercase bg-blue-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1 text-center">SL</th>
                    <th className="px-2 py-1 text-center">Year</th>
                    <th className="px-2 py-1 text-center">Status</th>
                    <th className="px-2 py-1 text-center">Atn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        কোনো রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    records.map((row) => (
                      <React.Fragment key={row.id}>
                        <tr className="bg-white">
                          <td className="px-2 py-1 text-center font-medium text-slate-900">{row.sl}</td>
                          <td className="px-2 py-1 text-center text-slate-600">{row.year}</td>
                          <td className="px-2 py-1 text-center">
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", getStatusBadgeClass(row.status))}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-2 py-1 text-center">
                            <button 
                              onClick={() => toggleRow(row.id)}
                              className="text-blue-600 p-1"
                            >
                              {expandedRows.has(row.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.has(row.id) && (
                          <tr className="bg-slate-50">
                            <td colSpan={4} className="p-2">
                              <div className="bg-[#D4EFDF] border border-slate-200 rounded-xl p-3 space-y-2 shadow-sm animate-in slide-in-from-top-2">
                                <div className="flex justify-between text-sm">
                                  <span className="font-semibold text-slate-800">Timestamp:</span>
                                  <span className="text-slate-700">{row.timestamp?.seconds ? new Date(row.timestamp.seconds * 1000).toLocaleString() : '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="font-semibold text-slate-800">Start Date:</span>
                                  <span className="text-slate-700">{row.startDate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="font-semibold text-slate-800">End Date:</span>
                                  <span className="text-slate-700">{row.endDate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="font-semibold text-slate-800">Amount:</span>
                                  <span className="font-bold text-slate-900">{row.amount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="font-semibold text-slate-800">Remark:</span>
                                  <span className="text-slate-700">{row.remark || '-'}</span>
                                </div>
                                
                                {isActionVisible && (
                                  <div className="flex justify-center gap-4 pt-3 mt-2 border-t border-slate-200/50 border-dashed">
                                    <button 
                                      onClick={() => handleOpenModal(row)}
                                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                    >
                                      <Edit className="w-5 h-5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteClick(row.id)}
                                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 italic">
              This table is hidden by administrator settings.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 px-2 py-1 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {currentRecord ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {currentRecord ? 'Edit Record' : 'Add New Record'}
              </h3>
              <button onClick={handleCloseModal} className="text-white/80 hover:text-white transition-colors">
                <ChevronDown className="w-6 h-6 rotate-45" /> {/* Close icon using rotated chevron or X */}
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Remark</label>
                  <textarea
                    rows={1}
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full hidden" />Save</div>}
                  {!isSaving && 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-red-600 px-2 py-1 flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-bold">Confirm Delete</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-700 font-medium mb-6">এই রেকর্ড মুছে ফেলবেন?</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  না
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  হ্যাঁ, মুছে ফেলুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
