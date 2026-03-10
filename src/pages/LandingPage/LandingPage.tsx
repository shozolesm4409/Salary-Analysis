import React, { useState } from 'react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { ArrowRight, Filter, Calculator, AlertCircle, Briefcase, FunctionSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import TransactionForm from '@/components/TransactionForm';
import TMIEPDFFilter from '@/pages/DataSummary/TMIEPDFFilter';
import Calculation from '@/pages/MoreOption/Calculation';
import ProjectList from './ProjectList';
import Formula from '@/pages/Formula/Formula';

export default function LandingPage() {
  const { user } = useAuth();
  const { isLandingHidden, loading } = useSettings();
  const [activeView, setActiveView] = useState<'transaction' | 'filter' | 'calculation' | 'project' | 'formula'>('transaction');

  const renderContent = () => {
    // Check if current view is hidden
    let isHidden = false;
    if (activeView === 'transaction' && isLandingHidden('landing_home')) isHidden = true;
    if (activeView === 'filter' && isLandingHidden('landing_filter')) isHidden = true;
    if (activeView === 'calculation' && isLandingHidden('landing_calculation')) isHidden = true;
    if (activeView === 'project' && isLandingHidden('landing_project')) isHidden = true;
    if (activeView === 'formula' && isLandingHidden('landing_formula')) isHidden = true;

    if (isHidden) {
      return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="bg-red-50 p-8 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-500 text-center max-w-md">
            This section has been disabled by the administrator. Please contact support if you believe this is an error.
          </p>
        </div>
      );
    }

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

    if (activeView === 'project') {
      return <ProjectList />;
    }
    
    if (activeView === 'formula') {
      return <Formula />;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <div className={`w-10 h-10 ${activeView === 'transaction' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'} rounded-full flex items-center justify-center -mt-6 shadow-lg border-4 border-white transition-colors`}>
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
          
          <button 
            onClick={() => setActiveView('project')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeView === 'project' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] font-medium">Project</span>
          </button>

          <button 
            onClick={() => setActiveView('formula')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeView === 'formula' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FunctionSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Formula</span>
          </button>
        </div>
      </div>
    </div>
  );
}
