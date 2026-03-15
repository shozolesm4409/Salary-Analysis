import { useState } from 'react';
import { 
  Calendar, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';

// Import sub-components
import TodayFilter from '@/components/TMIEPDF/TodayFilter';
import MonthlyFilter from '@/components/TMIEPDF/MonthlyFilter';
import IEFilter from '@/components/TMIEPDF/IEFilter';
import PDFFilter from '@/components/TMIEPDF/PDFFilter';

type TabType = 'today' | 'monthly' | 'ie' | 'pdf';

export default function TMIEPDFFilter() {
  const navigate = useNavigate();
  const { transactions, loading } = useTransactions();
  const [activeTab, setActiveTab] = useState<TabType>('today');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-1 sm:p-6">
      {/* Navigation Tabs */}
      <div className="flex justify-center mb-4">
        <div className="flex gap-0.5 sm:gap-2 p-0.5 sm:p-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab('today')}
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all whitespace-nowrap text-[10px] sm:text-sm md:text-base",
              activeTab === 'today' ? "bg-blue-500 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" /> Today
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all whitespace-nowrap text-[10px] sm:text-sm md:text-base",
              activeTab === 'monthly' ? "bg-blue-500 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Wallet className="w-3 h-3 sm:w-4 sm:h-4" /> Monthly
          </button>
          <button
            onClick={() => setActiveTab('ie')}
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all whitespace-nowrap text-[10px] sm:text-sm md:text-base",
              activeTab === 'ie' ? "bg-blue-500 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> IE Filter
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all whitespace-nowrap text-[10px] sm:text-sm md:text-base",
              activeTab === 'pdf' ? "bg-blue-500 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'today' && <TodayFilter transactions={transactions} />}
        {activeTab === 'monthly' && <MonthlyFilter transactions={transactions} />}
        {activeTab === 'ie' && <IEFilter transactions={transactions} />}
        {activeTab === 'pdf' && <PDFFilter transactions={transactions} />}
      </div>
    </div>
  );
}
