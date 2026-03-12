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
import MobileBottomNav from '@/components/MobileBottomNav';

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

      <MobileBottomNav activeView={activeView} onNavClick={setActiveView} />
    </div>
  );
}
