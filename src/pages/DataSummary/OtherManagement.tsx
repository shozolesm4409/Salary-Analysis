import React, { useState } from 'react';
import { Layout } from 'lucide-react';
import FormulaManage from '@/pages/MoreOption/FormulaManage';
import ProjectManage from '@/pages/MoreOption/ProjectManage';

export default function OtherManagement() {
  const [activeTab, setActiveTab] = useState<'formula' | 'project'>('formula');

  return (
    <div className="space-y-6 pb-10">
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('formula')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'formula' 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Formula Manage
        </button>
        <button
          onClick={() => setActiveTab('project')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'project' 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Project Manage
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'formula' ? <FormulaManage /> : <ProjectManage />}
      </div>
    </div>
  );
}
