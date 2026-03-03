import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettings } from '@/hooks/useSettings';
import { Transaction } from '@/types';
import { Plus, X, Loader2, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface TransactionFormProps {
  onClose: () => void;
  initialData?: Transaction;
}

export default function TransactionForm({ onClose, initialData }: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions();
  const { categories: allCategories, departments: allDepartments } = useSettings();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'income');
  
  const [formData, setFormData] = useState({
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
    amount: initialData?.amount?.toString() || '',
    category: initialData?.category || '',
    department: initialData?.department || '',
    description: initialData?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If category is "Other", use description as department as requested
      const finalDepartment = formData.category === 'Other' ? formData.description : formData.department;
      
      const transactionData = {
        type,
        date: formData.date,
        amount: parseFloat(formData.amount),
        category: formData.category,
        department: finalDepartment,
        description: formData.description,
        month: formData.date.substring(0, 7), // YYYY-MM
        timestamp: initialData?.timestamp || Date.now(),
      };

      if (initialData?.id) {
        await updateTransaction(initialData.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = allCategories
    .filter(cat => cat.type === type && !cat.hidden)
    .map(cat => cat.name);
    
  const filteredDepartments = allDepartments
    .filter(dept => (dept.type === type || dept.type === 'both') && !dept.hidden)
    .map(dept => dept.name);

  // Fallback to defaults if no categories/departments are added yet
  const categories = filteredCategories.length > 0 ? [...filteredCategories, 'Other'] : ['Other'];
  const departments = filteredDepartments;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {initialData ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              disabled={!!initialData}
              onClick={() => setType('income')}
              className={`py-2 text-sm font-medium rounded-md transition-all ${
                type === 'income' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              } ${initialData ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              Income
            </button>
            <button
              type="button"
              disabled={!!initialData}
              onClick={() => setType('expense')}
              className={`py-2 text-sm font-medium rounded-md transition-all ${
                type === 'expense' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              } ${initialData ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              Expense
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <Link to="/settings" className="text-[10px] text-blue-600 hover:underline flex items-center">
                  <Settings className="w-2 h-2 mr-0.5" /> Manage
                </Link>
              </div>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Department</label>
                <Link to="/settings" className="text-[10px] text-blue-600 hover:underline flex items-center">
                  <Settings className="w-2 h-2 mr-0.5" /> Manage
                </Link>
              </div>
              <select
                required={false}
                disabled={formData.category === 'Other'}
                value={formData.category === 'Other' ? 'Other' : formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Select Dept</option>
                {departments.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {formData.category === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (Required for Other Category)</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Enter custom department/description..."
              />
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center justify-center ${
                type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
