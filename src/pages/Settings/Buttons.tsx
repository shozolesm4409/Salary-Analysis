import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonsProps {
  buttonSettings: any[];
  updateButtonSetting: (id: string, isHidden: boolean) => Promise<void>;
}

export default function Buttons({ buttonSettings, updateButtonSetting }: ButtonsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">Button Visibility Management</h3>
        <p className="text-sm text-slate-500">Toggle visibility of specific buttons across the application</p>
      </div>
      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto scrollbar-thin">
        {buttonSettings.map((setting) => (
          <div key={setting.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-lg",
                setting.isHidden ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600"
              )}>
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{setting.label}</p>
                <p className="text-xs text-slate-500">{setting.isHidden ? 'Hidden' : 'Visible'}</p>
              </div>
            </div>
            <button
              onClick={() => updateButtonSetting(setting.id, !setting.isHidden)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
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
