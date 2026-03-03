import React from 'react';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsListProps {
  items: any[];
  typeFilter: 'all' | 'income' | 'expense' | 'both';
  setTypeFilter: (type: 'all' | 'income' | 'expense' | 'both') => void;
  visibilityFilter: 'all' | 'visible' | 'hidden';
  setVisibilityFilter: (visibility: 'all' | 'visible' | 'hidden') => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, hidden: boolean) => void;
  showActions?: boolean;
}

export default function SettingsList({
  items,
  typeFilter,
  setTypeFilter,
  visibilityFilter,
  setVisibilityFilter,
  onEdit,
  onDelete,
  onToggleVisibility,
  showActions = true
}: SettingsListProps) {
  const filteredItems = items
    .filter(item => typeFilter === 'all' || item.type === typeFilter)
    .filter(item => {
      if (visibilityFilter === 'all') return true;
      if (visibilityFilter === 'visible') return !item.hidden;
      if (visibilityFilter === 'hidden') return item.hidden;
      return true;
    });

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  <div className="flex items-center gap-2">
                    Type
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="ml-1 px-2 py-1 text-[10px] font-bold rounded border border-slate-200 bg-white text-slate-600 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  <div className="flex items-center gap-2">
                    Status
                    <select
                      value={visibilityFilter}
                      onChange={(e) => setVisibilityFilter(e.target.value as any)}
                      className="ml-1 px-2 py-1 text-[10px] font-bold rounded border border-slate-200 bg-white text-slate-600 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </th>
                {showActions && <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item, index) => (
                <tr key={`${item.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium capitalize",
                      item.type === 'income' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    )}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.hidden ? (
                      <span className="flex items-center text-slate-400 text-xs">
                        <EyeOff className="w-3 h-3 mr-1" /> Hidden
                      </span>
                    ) : (
                      <span className="flex items-center text-emerald-600 text-xs font-medium">
                        <Eye className="w-3 h-3 mr-1" /> Visible
                      </span>
                    )}
                  </td>
                  {showActions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onToggleVisibility(item.id!, !item.hidden)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md"
                          title={item.hidden ? "Show" : "Hide"}
                        >
                          {item.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id!)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Filters:</span>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-white text-slate-600 outline-none"
            >
              <option value="all">Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="both">Both</option>
            </select>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as any)}
              className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-white text-slate-600 outline-none"
            >
              <option value="all">Status</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {filteredItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">{item.name}</h4>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold capitalize",
                    item.type === 'income' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  )}>
                    {item.type}
                  </span>
                  {item.hidden ? (
                    <span className="flex items-center text-slate-400 text-[10px]">
                      <EyeOff className="w-2.5 h-2.5 mr-1" /> Hidden
                    </span>
                  ) : (
                    <span className="flex items-center text-emerald-600 text-[10px] font-bold">
                      <Eye className="w-2.5 h-2.5 mr-1" /> Visible
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {showActions && (
                  <>
                    <button
                      onClick={() => onToggleVisibility(item.id!, !item.hidden)}
                      className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"
                    >
                      {item.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id!)}
                      className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
