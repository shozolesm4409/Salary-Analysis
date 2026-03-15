import { useState, useMemo } from 'react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { Download, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types';
import { generatePDF } from './utils';

interface PDFFilterProps {
  transactions: Transaction[];
}

export default function PDFFilter({ transactions }: PDFFilterProps) {
  const [pdfStartDate, setPdfStartDate] = useState<string>('');
  const [pdfEndDate, setPdfEndDate] = useState<string>('');
  const [showPdfResult, setShowPdfResult] = useState(false);

  const pdfTransactions = useMemo(() => {
    if (!pdfStartDate || !pdfEndDate) return [];
    return transactions.filter(t => 
      isWithinInterval(parseISO(t.date), {
        start: parseISO(pdfStartDate),
        end: parseISO(pdfEndDate)
      })
    );
  }, [transactions, pdfStartDate, pdfEndDate]);

  const handlePdfSubmit = () => {
    if (pdfStartDate && pdfEndDate) setShowPdfResult(true);
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-bold text-blue-500">Generate PDF & Print</h2>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col text-left gap-1">
            <label className="font-bold text-slate-700 text-sm">Start Date:</label>
            <input
              type="date"
              value={pdfStartDate}
              onChange={(e) => setPdfStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col text-left gap-1">
            <label className="font-bold text-slate-700 text-sm">End Date:</label>
            <input
              type="date"
              value={pdfEndDate}
              onChange={(e) => setPdfEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <button
          onClick={handlePdfSubmit}
          className="w-full sm:w-auto px-10 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-bold"
        >
          Submit
        </button>
      </div>

      {showPdfResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500">
                        {t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date'}
                      </p>
                      <h4 className="text-sm font-bold text-slate-800">{t.category}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[11px] font-bold",
                        t.type === 'income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-600">{t.department}</span>
                    </div>
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
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
