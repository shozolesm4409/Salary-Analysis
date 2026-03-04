import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, LogIn, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PublicHeaderProps {
  onNavClick?: (view: 'transaction' | 'filter' | 'calculation') => void;
}

export default function PublicHeader({ onNavClick }: PublicHeaderProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{ displayName?: string; photoBase64?: string } | null>(null);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as any);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const photoUrl = userProfile?.photoBase64 || user?.photoURL;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Wallet className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-slate-900">FinDash</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onNavClick && onNavClick('transaction')} 
            className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => onNavClick && onNavClick('filter')} 
            className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            Filter
          </button>
          <button 
            onClick={() => onNavClick && onNavClick('calculation')} 
            className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            Calculation
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dashboard</div>
                <div className="text-sm font-bold text-slate-900">{displayName}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-5 h-5 text-slate-500" />
                )}
              </div>
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
