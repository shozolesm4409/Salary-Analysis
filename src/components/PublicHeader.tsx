import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, LogIn, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PublicHeader() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Wallet className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-slate-900">FinDash</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
          <Link to="/features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Features</Link>
          <Link to="/about" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">About</Link>
          <Link to="/contact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
