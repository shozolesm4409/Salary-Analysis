import React from 'react';
import { Home, Filter, Calculator, Folder, FunctionSquare } from 'lucide-react';

interface PublicFooterProps {
  onNavClick?: (view: 'transaction' | 'filter' | 'calculation' | 'project' | 'formula') => void;
}

export default function PublicFooter({ onNavClick }: PublicFooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Salary Analytics</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => onNavClick && onNavClick('transaction')} 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button 
              onClick={() => onNavClick && onNavClick('filter')} 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button 
              onClick={() => onNavClick && onNavClick('calculation')} 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Calculation
            </button>
            <button 
              onClick={() => onNavClick && onNavClick('project')} 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <Folder className="w-4 h-4" />
              Project
            </button>
            <button 
              onClick={() => onNavClick && onNavClick('formula')} 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <FunctionSquare className="w-4 h-4" />
              Formula
            </button>
          </nav>
        </div>
        
        <div className="text-center text-sm text-slate-500 border-t border-slate-800 pt-6">
          <p>&copy; {new Date().getFullYear()} Salary Analytics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
