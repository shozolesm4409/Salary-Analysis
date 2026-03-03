import React, { useState } from 'react';
import DeletedTransactions from './DeletedTransactions';
import DeletedIncrementRecords from './DeletedIncrementRecords';
import { cn } from '@/lib/utils';

export default function DeletedRecords() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'increment'>('transactions');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('transactions')}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'transactions'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('increment')}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'increment'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            Increment
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'transactions' ? (
          <DeletedTransactions />
        ) : (
          <DeletedIncrementRecords />
        )}
      </div>
    </div>
  );
}
