import React from 'react';
import { Layout } from 'lucide-react';

export default function OtherManagement() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Other Management</h1>
      </div>

      <div className="bg-white p-10 rounded-xl shadow-lg border border-slate-200 text-center text-slate-500">
        <Layout className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">Other Settings</h3>
        <p className="font-medium">Other settings and management options can be added here in the future.</p>
      </div>
    </div>
  );
}
