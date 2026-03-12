import React from 'react';
import { ArrowRight, Filter, Calculator, Briefcase, FunctionSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  activeView?: 'transaction' | 'filter' | 'calculation' | 'project' | 'formula';
  onNavClick?: (view: 'transaction' | 'filter' | 'calculation' | 'project' | 'formula') => void;
}

export default function MobileBottomNav({ activeView, onNavClick }: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (view: 'transaction' | 'filter' | 'calculation' | 'project' | 'formula') => {
    if (onNavClick) {
      onNavClick(view);
    } else {
      // If we're not on the landing page, navigate to it
      // We can't easily set the state of LandingPage from here without global state
      // but we can at least go to the home page
      navigate('/');
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => handleNavClick('transaction')}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            activeView === 'transaction' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center -mt-6 shadow-lg border-4 border-white transition-colors",
            activeView === 'transaction' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
          )}>
            <ArrowRight className="w-5 h-5 rotate-[-45deg]" />
          </div>
          <span className="text-[10px] font-medium">Add Txn</span>
        </button>
        
        <button 
          onClick={() => handleNavClick('filter')}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            activeView === 'filter' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Filter className="w-5 h-5" />
          <span className="text-[10px] font-medium">Filter</span>
        </button>
        
        <button 
          onClick={() => handleNavClick('calculation')}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            activeView === 'calculation' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] font-medium">Calculate</span>
        </button>
        
        <button 
          onClick={() => handleNavClick('project')}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            activeView === 'project' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] font-medium">Project</span>
        </button>

        <button 
          onClick={() => handleNavClick('formula')}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            activeView === 'formula' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <FunctionSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Formula</span>
        </button>
      </div>
    </div>
  );
}
