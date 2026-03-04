import React from 'react';

interface PublicFooterProps {
  onNavClick?: (view: 'transaction' | 'filter' | 'calculation') => void;
}

export default function PublicFooter({ onNavClick }: PublicFooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">FinDash</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => onNavClick && onNavClick('transaction')} 
              className="text-slate-400 hover:text-white transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => onNavClick && onNavClick('filter')} 
              className="text-slate-400 hover:text-white transition-colors"
            >
              Filter
            </button>
            <button 
              onClick={() => onNavClick && onNavClick('calculation')} 
              className="text-slate-400 hover:text-white transition-colors"
            >
              Calculation
            </button>
          </nav>
        </div>
        
        <div className="text-center text-sm text-slate-500 border-t border-slate-800 pt-6">
          <p>&copy; {new Date().getFullYear()} FinDash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
