import React from 'react';
import { Table as TableIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TablesProps {
  tableSettings: any[];
  updateTableSetting: (id: string, isHidden: boolean) => Promise<void>;
}

export default function Tables({ tableSettings, updateTableSetting }: TablesProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">Table Visibility Management</h3>
        <p className="text-sm text-slate-500">Toggle visibility of tables across the application</p>
      </div>
      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto scrollbar-thin">
        {tableSettings.map((setting) => (
          <div key={setting.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-lg",
                setting.isHidden ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600"
              )}>
                <TableIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{setting.label}</h4>
                <p className="text-xs text-slate-500">
                  {setting.isHidden ? 'Currently hidden from menus' : 'Currently visible in menus'}
                </p>
              </div>
            </div>
            <button
              onClick={() => updateTableSetting(setting.id, !setting.isHidden)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                setting.isHidden ? "bg-slate-200" : "bg-blue-600"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  setting.isHidden ? "translate-x-1" : "translate-x-6"
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
