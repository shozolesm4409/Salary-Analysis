import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { format, parseISO, isSameDay, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Download,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Printer,
  RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';

export default function TMIEPDFFilter() {
  const { transactions, loading } = useTransactions();
  const [activeTab, setActiveTab] = useState<'today' | 'monthly' | 'pdf' | 'ie'>('today');
  
  // Today Filter State
  const [todayDate, setTodayDate] = useState<string>('');
  const [showTodayResult, setShowTodayResult] = useState(false);

  // Monthly Filter State
  const [monthlyStartDate, setMonthlyStartDate] = useState<string>('');
  const [monthlyEndDate, setMonthlyEndDate] = useState<string>('');
  const [showMonthlyResult, setShowMonthlyResult] = useState(false);
  const [monthlyActiveSubTab, setMonthlyActiveSubTab] = useState<'summary' | 'income' | 'expense'>('summary');

  // PDF Generator State
  const [pdfStartDate, setPdfStartDate] = useState<string>('');
  const [pdfEndDate, setPdfEndDate] = useState<string>('');
  const [showPdfResult, setShowPdfResult] = useState(false);

  // IE Filter State
  const [ieFilterType, setIeFilterType] = useState<'Income' | 'Expense' | ''>('');
  const [ieFilterTopic, setIeFilterTopic] = useState<string>('');
  const [showIeResult, setShowIeResult] = useState(false);

  // --- Logic for Today Filter ---
  const todayTransactions = useMemo(() => {
    if (!todayDate) return [];
    return transactions.filter(t => isSameDay(parseISO(t.date), parseISO(todayDate)));
  }, [transactions, todayDate]);

  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // --- Logic for Monthly Filter ---
  const monthlyTransactions = useMemo(() => {
    if (!monthlyStartDate || !monthlyEndDate) return [];
    return transactions.filter(t => 
      isWithinInterval(parseISO(t.date), {
        start: parseISO(monthlyStartDate),
        end: parseISO(monthlyEndDate)
      })
    );
  }, [transactions, monthlyStartDate, monthlyEndDate]);

  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;

  // --- Logic for PDF Filter ---
  const pdfTransactions = useMemo(() => {
    if (!pdfStartDate || !pdfEndDate) return [];
    return transactions.filter(t => 
      isWithinInterval(parseISO(t.date), {
        start: parseISO(pdfStartDate),
        end: parseISO(pdfEndDate)
      })
    );
  }, [transactions, pdfStartDate, pdfEndDate]);

  const pdfIncome = pdfTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const pdfExpense = pdfTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // --- Logic for IE Filter ---
  const availableTopics = useMemo(() => {
    if (!ieFilterType) return [];
    const type = ieFilterType.toLowerCase() as 'income' | 'expense';
    return Array.from(new Set(transactions.filter(t => t.type === type).map(t => t.category))).sort();
  }, [transactions, ieFilterType]);

  const ieTransactions = useMemo(() => {
    if (!ieFilterType || !ieFilterTopic) return [];
    const type = ieFilterType.toLowerCase() as 'income' | 'expense';
    return transactions.filter(t => t.type === type && t.category === ieFilterTopic);
  }, [transactions, ieFilterType, ieFilterTopic]);

  const ieTotal = ieTransactions.reduce((sum, t) => sum + t.amount, 0);

  // --- Handlers ---

  const handleTodaySubmit = () => {
    if (todayDate) setShowTodayResult(true);
  };

  const handleMonthlySubmit = () => {
    if (monthlyStartDate && monthlyEndDate) setShowMonthlyResult(true);
  };

  const handlePdfSubmit = () => {
    if (pdfStartDate && pdfEndDate) setShowPdfResult(true);
  };

  const handleIeSubmit = () => {
    if (ieFilterType && ieFilterTopic) setShowIeResult(true);
  };

  const resetAll = () => {
    setTodayDate('');
    setShowTodayResult(false);
    setMonthlyStartDate('');
    setMonthlyEndDate('');
    setShowMonthlyResult(false);
    setPdfStartDate('');
    setPdfEndDate('');
    setShowPdfResult(false);
    setIeFilterType('');
    setIeFilterTopic('');
    setShowIeResult(false);
  };

  const generatePDF = (data: typeof transactions, title: string) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 30);
    
    const tableColumn = ["Date", "Type", "Category", "Department", "Amount", "Description"];
    const tableRows = data.map(t => [
      t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date',
      t.type,
      t.category,
      t.department,
      t.type === 'income' ? `+${t.amount}` : `-${t.amount}`,
      t.description || ''
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 133, 244] }
    });

    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1 sm:p-4">
      {/* Navigation Buttons */}
      <div className="flex flex-nowrap overflow-x-auto justify-start sm:justify-center gap-2 mb-8 p-1 no-scrollbar">
        <button
          onClick={() => { setActiveTab('today'); resetAll(); }}
          className={cn(
            "px-3 sm:px-6 py-1.5 sm:py-2 rounded-md text-white text-sm sm:text-base font-medium transition-colors whitespace-nowrap",
            activeTab === 'today' ? "bg-green-600" : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          Today
        </button>
        <button
          onClick={() => { setActiveTab('monthly'); resetAll(); }}
          className={cn(
            "px-3 sm:px-6 py-1.5 sm:py-2 rounded-md text-white text-sm sm:text-base font-medium transition-colors whitespace-nowrap",
            activeTab === 'monthly' ? "bg-green-600" : "bg-orange-500 hover:bg-orange-600"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => { setActiveTab('ie'); resetAll(); }}
          className={cn(
            "px-3 sm:px-6 py-1.5 sm:py-2 rounded-md text-white text-sm sm:text-base font-medium transition-colors whitespace-nowrap",
            activeTab === 'ie' ? "bg-green-600" : "bg-red-500 hover:bg-red-600"
          )}
        >
          IE Filter
        </button>
        <button
          onClick={() => { setActiveTab('pdf'); resetAll(); }}
          className={cn(
            "px-3 sm:px-6 py-1.5 sm:py-2 rounded-md text-white text-sm sm:text-base font-medium transition-colors whitespace-nowrap",
            activeTab === 'pdf' ? "bg-green-600" : "bg-purple-600 hover:bg-purple-700"
          )}
        >
          PDF
        </button>
      </div>

      {/* Today Section */}
      {activeTab === 'today' && (
        <div className="space-y-6 text-center">
          <h2 className="text-xl font-bold text-blue-500">Today Filter</h2>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <input
              type="date"
              value={todayDate}
              onChange={(e) => setTodayDate(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleTodaySubmit}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Show Today
            </button>
          </div>

          {showTodayResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-3 sm:p-4 rounded-lg text-white shadow-lg">
                  <h3 className="text-sm sm:text-lg font-semibold mb-1">Total Expense</h3>
                  <p className="text-lg sm:text-2xl font-bold">{todayExpense.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-500 p-3 sm:p-4 rounded-lg text-white shadow-lg">
                  <h3 className="text-sm sm:text-lg font-semibold mb-1">Total Deposit</h3>
                  <p className="text-lg sm:text-2xl font-bold">{todayIncome.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200 hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2">Department</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {todayTransactions.length > 0 ? (
                        todayTransactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2">{t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}</td>
                            <td className="px-4 py-2 capitalize">{t.type}</td>
                            <td className="px-4 py-2">{t.category}</td>
                            <td className="px-4 py-2">{t.department}</td>
                            <td className="px-4 py-2 text-right font-bold">
                              {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-red-500 font-bold">
                            No data found for this date.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View for Today Table */}
              <div className="md:hidden space-y-3 text-left">
                {todayTransactions.length > 0 ? (
                  todayTransactions.map((t) => (
                    <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-500">{format(new Date(t.date), 'dd MMM yyyy')}</p>
                          <h4 className="font-bold text-slate-800 mt-1">{t.category}</h4>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-bold",
                          t.type === 'income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-slate-100">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-medium text-slate-800">{t.department}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-red-500 font-bold shadow-sm">
                    No data found for this date.
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => generatePDF(todayTransactions, `Transactions_${todayDate}`)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> PDF-Generate
                </button>
                <button
                  onClick={resetAll}
                  className="px-6 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Section */}
      {activeTab === 'monthly' && (
        <div className="space-y-6 text-center">
          <h2 className="text-xl font-bold text-blue-500">Monthly Filter</h2>
          <div className="flex justify-center items-center gap-4 flex-wrap bg-white p-4 rounded-lg shadow-sm border border-slate-200 inline-flex mx-auto">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">Start Date:</label>
              <input
                type="date"
                value={monthlyStartDate}
                onChange={(e) => setMonthlyStartDate(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">End Date:</label>
              <input
                type="date"
                value={monthlyEndDate}
                onChange={(e) => setMonthlyEndDate(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={handleMonthlySubmit}
              className="px-6 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </div>

          {showMonthlyResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-3 sm:p-4 rounded-lg text-white shadow-lg">
                  <h3 className="text-sm sm:text-lg font-semibold mb-1">Total Expense</h3>
                  <p className="text-lg sm:text-2xl font-bold">{monthlyExpense.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-500 p-3 sm:p-4 rounded-lg text-white shadow-lg">
                  <h3 className="text-sm sm:text-lg font-semibold mb-1">Total Deposit</h3>
                  <p className="text-lg sm:text-2xl font-bold">{monthlyIncome.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setMonthlyActiveSubTab('summary')}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-white text-sm font-medium transition-colors",
                    monthlyActiveSubTab === 'summary' ? "bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  Summary
                </button>
                <button
                  onClick={() => setMonthlyActiveSubTab('income')}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-white text-sm font-medium transition-colors",
                    monthlyActiveSubTab === 'income' ? "bg-green-600" : "bg-green-500 hover:bg-green-600"
                  )}
                >
                  Income
                </button>
                <button
                  onClick={() => setMonthlyActiveSubTab('expense')}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-white text-sm font-medium transition-colors",
                    monthlyActiveSubTab === 'expense' ? "bg-green-600" : "bg-red-500 hover:bg-red-600"
                  )}
                >
                  Expense
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200 hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2">Department</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monthlyTransactions
                        .filter(t => {
                          if (monthlyActiveSubTab === 'income') return t.type === 'income';
                          if (monthlyActiveSubTab === 'expense') return t.type === 'expense';
                          return true;
                        })
                        .map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2">{t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}</td>
                            <td className="px-4 py-2 capitalize">{t.type}</td>
                            <td className="px-4 py-2">{t.category}</td>
                            <td className="px-4 py-2">{t.department}</td>
                            <td className="px-4 py-2 text-right font-bold">
                              {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      {monthlyTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-red-500 font-bold">
                            No data found for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View for Monthly Table */}
              <div className="md:hidden space-y-3 text-left">
                {monthlyTransactions.length > 0 ? (
                  monthlyTransactions
                    .filter(t => {
                      if (monthlyActiveSubTab === 'income') return t.type === 'income';
                      if (monthlyActiveSubTab === 'expense') return t.type === 'expense';
                      return true;
                    })
                    .map((t) => (
                      <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-500">{t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}</p>
                            <h4 className="font-bold text-slate-800 mt-1">{t.category}</h4>
                          </div>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-bold",
                            t.type === 'income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-slate-100">
                          <span className="text-slate-500">Department:</span>
                          <span className="font-medium text-slate-800">{t.department}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-red-500 font-bold shadow-sm">
                    No data found for this period.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PDF Generator Section */}
      {activeTab === 'pdf' && (
        <div className="space-y-6 text-center">
          <h2 className="text-xl font-bold text-blue-500">Generate PDF & Print</h2>
          <div className="flex justify-center items-center gap-4 flex-wrap bg-white p-4 rounded-lg shadow-sm border border-slate-200 inline-flex mx-auto">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">Start Date:</label>
              <input
                type="date"
                value={pdfStartDate}
                onChange={(e) => setPdfStartDate(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">End Date:</label>
              <input
                type="date"
                value={pdfEndDate}
                onChange={(e) => setPdfEndDate(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={handlePdfSubmit}
              className="px-6 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </div>

          {showPdfResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-3 sm:p-4 rounded-lg text-white shadow-lg">
                  <h3 className="text-sm sm:text-lg font-semibold mb-1">Expense:</h3>
                  <p className="text-lg sm:text-2xl font-bold">{pdfExpense.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-500 p-3 sm:p-4 rounded-lg text-white shadow-lg">
                  <h3 className="text-sm sm:text-lg font-semibold mb-1">Income:</h3>
                  <p className="text-lg sm:text-2xl font-bold">{pdfIncome.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200 hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2">Department</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pdfTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2">{t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}</td>
                          <td className="px-4 py-2 capitalize">{t.type}</td>
                          <td className="px-4 py-2">{t.category}</td>
                          <td className="px-4 py-2">{t.department}</td>
                          <td className="px-4 py-2 text-right font-bold">
                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {pdfTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-red-500 font-bold">
                            No data found for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View for PDF Table */}
              <div className="md:hidden space-y-3 text-left">
                {pdfTransactions.length > 0 ? (
                  pdfTransactions.map((t) => (
                    <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-500">{t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}</p>
                          <h4 className="font-bold text-slate-800 mt-1">{t.category}</h4>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-bold",
                          t.type === 'income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-slate-100">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-medium text-slate-800">{t.department}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-red-500 font-bold shadow-sm">
                    No data found for this period.
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => generatePDF(pdfTransactions, `Report_${pdfStartDate}_to_${pdfEndDate}`)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> PDF-Generate
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* IE Filter Section */}
      {activeTab === 'ie' && (
        <div className="space-y-6 text-center">
          <h2 className="text-xl font-bold text-blue-500">Income & Expense Filter</h2>
          <div className="flex justify-center items-end gap-4 flex-wrap">
            <div className="flex flex-col text-left gap-1">
              <label className="font-bold text-slate-700 text-sm">Filter Type:</label>
              <select
                value={ieFilterType}
                onChange={(e) => {
                  setIeFilterType(e.target.value as 'Income' | 'Expense');
                  setIeFilterTopic('');
                }}
                className="w-48 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Filter Type</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <div className="flex flex-col text-left gap-1">
              <label className="font-bold text-slate-700 text-sm">Filter Topic:</label>
              <select
                value={ieFilterTopic}
                onChange={(e) => setIeFilterTopic(e.target.value)}
                disabled={!ieFilterType}
                className="w-48 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">Select Filter Topic</option>
                {availableTopics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleIeSubmit}
              disabled={!ieFilterType || !ieFilterTopic}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed mb-[1px]"
            >
              Submit
            </button>
          </div>

          {showIeResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-4xl mx-auto">
                <div className="bg-white border-2 border-slate-300 p-3 sm:p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm sm:text-lg font-medium text-slate-700 mb-1">
                    {ieFilterType === 'Income' ? 'Total Income' : 'Total Expense'}
                  </h3>
                  <p className="text-lg sm:text-xl font-bold flex items-center justify-center gap-2">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    {ieTotal.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white border-2 border-slate-300 p-3 sm:p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm sm:text-lg font-medium text-slate-700 mb-1">
                    {ieFilterType === 'Income' ? 'Income Count' : 'Expense Count'}
                  </h3>
                  <p className="text-lg sm:text-xl font-bold flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    {ieTransactions.length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200 hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ieTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2">{t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}</td>
                          <td className="px-4 py-2 capitalize">{t.type}</td>
                          <td className="px-4 py-2 font-bold">{t.amount.toLocaleString()}</td>
                          <td className="px-4 py-2">{t.department}</td>
                        </tr>
                      ))}
                      {ieTransactions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-red-500 font-bold">
                            No data found for this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View for IE Table */}
              <div className="md:hidden space-y-3 text-left">
                {ieTransactions.length > 0 ? (
                  ieTransactions.map((t) => (
                    <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-500">{t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}</p>
                          <h4 className="font-bold text-slate-800 mt-1 capitalize">{t.type}</h4>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-bold",
                          t.type === 'income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {t.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-slate-100">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-medium text-slate-800">{t.department}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-red-500 font-bold shadow-sm">
                    No data found for this filter.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
