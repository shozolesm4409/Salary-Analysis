import React, { useState } from 'react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { ArrowRight, Filter, Calculator } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import TransactionForm from '@/components/TransactionForm';
import TMIEPDFFilter from '@/pages/DataSummary/TMIEPDFFilter';
import Calculation from '@/pages/MoreOption/Calculation';

export default function LandingPage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'transaction' | 'filter' | 'calculation'>('transaction');

  const renderContent = () => {
    if (activeView === 'transaction') {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Transaction</h2>
            <TransactionForm onClose={() => {}} isInline={true} />
          </div>
        </div>
      );
    }

    if (activeView === 'filter') {
      return (
        <div className="container mx-auto px-4 py-8">
          <TMIEPDFFilter />
        </div>
      );
    }

    if (activeView === 'calculation') {
      return (
        <div className="container mx-auto px-4 py-8">
          <Calculation />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <PublicHeader onNavClick={setActiveView} />

      <main className="flex-1 pt-16">
        {renderContent()}
      </main>

      <PublicFooter onNavClick={setActiveView} />

      {/* Mobile Bottom Navigation (Sticky) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveView('transaction')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeView === 'transaction' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center -mt-6 shadow-lg border-4 border-white">
              <ArrowRight className="w-5 h-5 rotate-[-45deg]" />
            </div>
            <span className="text-[10px] font-medium">Add Txn</span>
          </button>
          <button 
            onClick={() => setActiveView('filter')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeView === 'filter' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Filter className="w-5 h-5" />
            <span className="text-[10px] font-medium">Filter</span>
          </button>
          <button 
            onClick={() => setActiveView('calculation')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeView === 'calculation' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] font-medium">Calculate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
