import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Eye, EyeOff, Layout, List, MousePointer2, Table as TableIcon } from 'lucide-react';

export default function VisibilityManage() {
  const { menuSettings, updateMenuSetting } = useSettings();

  const categories = [
    { id: 'menu', label: 'Menus', icon: List },
    { id: 'tab', label: 'Tabs', icon: Layout },
    { id: 'table', label: 'Tables', icon: TableIcon },
    { id: 'button', label: 'Buttons', icon: MousePointer2 },
  ];

  const getSettingsByCategory = (category: string) => {
    return menuSettings.filter(s => s.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Visibility Management
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Control which menus, tabs, and UI elements are visible across the application.
          </p>
        </div>

        <div className="p-4 space-y-8">
          {categories.map((category) => {
            const settings = getSettingsByCategory(category.id);
            if (settings.length === 0) return null;

            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <category.icon className="w-4 h-4 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    {category.label}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {settings.map((setting) => (
                    <div
                      key={setting.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        setting.isHidden
                          ? 'bg-slate-50 border-slate-200 opacity-75'
                          : 'bg-white border-blue-100 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${setting.isHidden ? 'text-slate-500' : 'text-slate-900'}`}>
                          {setting.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {setting.isHidden ? 'Hidden' : 'Visible'}
                        </span>
                      </div>

                      <button
                        onClick={() => updateMenuSetting(setting.id, !setting.isHidden)}
                        className={`p-2 rounded-full transition-colors ${
                          setting.isHidden
                            ? 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                        title={setting.isHidden ? 'Unhide' : 'Hide'}
                      >
                        {setting.isHidden ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Changes are applied immediately across the entire application. Some elements might require a page refresh to update their visibility state if they are already rendered.
        </p>
      </div>
    </div>
  );
}
