import React, { useState, useEffect } from 'react';
import { Layout } from 'lucide-react';
import FormulaManage from '@/pages/MoreOption/FormulaManage';
import ProjectManage from '@/pages/MoreOption/ProjectManage';
import VisibilityManage from '@/pages/MoreOption/VisibilityManage';
import { useSettings } from '@/hooks/useSettings';

type TabType = 'formula' | 'project' | 'visibility';

export default function OtherManagement() {
  const { isMenuHidden } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('formula');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'formula', label: 'Formula Manage Tab' },
    { id: 'project', label: 'Project Manage Tab' },
    { id: 'visibility', label: 'Visibility Manage Tab' },
  ];

  const visibleTabs = tabs.filter(tab => !isMenuHidden(tab.label));

  useEffect(() => {
    const currentTabLabel = tabs.find(t => t.id === activeTab)?.label;
    if (currentTabLabel && isMenuHidden(currentTabLabel) && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [isMenuHidden, activeTab, visibleTabs]);

  return (
    <div className="flex flex-col h-full">
      <div className="sticky -top-2 lg:-top-4 z-20 bg-slate-50 -mt-2 pt-2 lg:-mt-4 lg:pt-4 flex gap-2 border-b border-slate-200 pb-2 -mx-2 px-2 lg:-mx-4 lg:px-4 overflow-x-auto no-scrollbar">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label.replace(' Tab', '')}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 pb-10">
        {visibleTabs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium">All management tabs are currently hidden.</p>
            <p className="text-xs text-slate-400 mt-1">Enable them in Visibility Manage settings.</p>
          </div>
        ) : (
          <>
            {activeTab === 'formula' && <FormulaManage />}
            {activeTab === 'project' && <ProjectManage />}
            {activeTab === 'visibility' && <VisibilityManage />}
          </>
        )}
      </div>
    </div>
  );
}
