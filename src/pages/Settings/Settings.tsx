import React, { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { 
  Plus, 
  EyeOff,
  Settings as SettingsIcon,
  Layers,
  Building2,
  Upload,
  Table as TableIcon,
  MousePointerClick,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/hooks/useTransactions';

// Import refactored components
import Categories from './Categories';
import Departments from './Departments';
import Tables from './Tables';
import Buttons from './Buttons';
import Actions from './Actions';
import Landing from './Landing';

export default function Settings() {
  const { 
    categories, 
    departments, 
    loading: settingsLoading, 
    error,
    addCategory, 
    updateCategory, 
    deleteCategory,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    tableSettings,
    updateTableSetting,
    buttonSettings,
    updateButtonSetting,
    actionSettings,
    updateActionSetting,
    landingSettings,
    updateLandingSetting
  } = useSettings();

  const { addTransaction } = useTransactions();

  const [activeTab, setActiveTab] = useState<'categories' | 'departments' | 'tables' | 'buttons' | 'actions' | 'landing'>('categories');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'both'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', type: 'income' as 'income' | 'expense' | 'both' });

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, type: item.type || 'income' });
    } else {
      setEditingItem(null);
      setFormData({ name: '', type: 'income' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'categories') {
      if (editingItem) {
        await updateCategory(editingItem.id, { name: formData.name, type: formData.type });
      } else {
        await addCategory({ name: formData.name, type: formData.type, hidden: false });
      }
    } else if (activeTab === 'departments') {
      if (editingItem) {
        await updateDepartment(editingItem.id, { name: formData.name, type: formData.type });
      } else {
        await addDepartment({ name: formData.name, type: formData.type, hidden: false });
      }
    }
    setIsModalOpen(false);
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-l h-12 w-12 border-b-2 border-blue-600"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings & Management</h1>
          <p className="text-slate-500">Manage your categories and departments</p>
        </div>
        {(activeTab === 'categories' || activeTab === 'departments') && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New {activeTab === 'categories' ? 'Category' : 'Department'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-thin">
        <div className="flex min-w-max">
          <button
            onClick={() => setActiveTab('categories')}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'categories' 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <div className="flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Categories
            </div>
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'departments' 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <div className="flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Departments
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'tables' 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <div className="flex items-center">
              <TableIcon className="w-4 h-4 mr-2" />
              Tables
            </div>
          </button>
          <button
            onClick={() => setActiveTab('buttons')}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'buttons' 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <div className="flex items-center">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Buttons
            </div>
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'actions' 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <div className="flex items-center">
              <MousePointerClick className="w-4 h-4 mr-2" />
              Actions
            </div>
          </button>
          <button
            onClick={() => setActiveTab('landing')}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'landing' 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <div className="flex items-center">
              <Layout className="w-4 h-4 mr-2" />
              Landing
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'categories' && (
          <Categories 
            categories={categories}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            visibilityFilter={visibilityFilter}
            setVisibilityFilter={setVisibilityFilter}
            onEdit={handleOpenModal}
            onDelete={(id) => {
              if (confirm('Are you sure?')) deleteCategory(id);
            }}
            onToggleVisibility={(id, hidden) => updateCategory(id, { hidden })}
          />
        )}

        {activeTab === 'departments' && (
          <Departments 
            departments={departments}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            visibilityFilter={visibilityFilter}
            setVisibilityFilter={setVisibilityFilter}
            onEdit={handleOpenModal}
            onDelete={(id) => {
              if (confirm('Are you sure?')) deleteDepartment(id);
            }}
            onToggleVisibility={(id, hidden) => updateDepartment(id, { hidden })}
          />
        )}

        {activeTab === 'tables' && (
          <Tables 
            tableSettings={tableSettings}
            updateTableSetting={updateTableSetting}
          />
        )}

        {activeTab === 'buttons' && (
          <Buttons 
            buttonSettings={buttonSettings}
            updateButtonSetting={updateButtonSetting}
          />
        )}

        {activeTab === 'actions' && (
          <Actions 
            actionSettings={actionSettings}
            updateActionSetting={updateActionSetting}
          />
        )}

        {activeTab === 'landing' && (
          <Landing 
            landingSettings={landingSettings}
            updateLandingSetting={updateLandingSetting}
          />
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingItem ? 'সম্পাদনা করুন' : 'নতুন যোগ করুন'} {activeTab === 'categories' ? 'ক্যাটাগরি' : 'ডিপার্টমেন্ট'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">নাম</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="নাম লিখুন..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ধরণ</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'আপডেট' : 'সংরক্ষণ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
