import React, { useState } from 'react';
import { Calculator, Trash2, Printer } from 'lucide-react';

export default function EarnedCalculation() {
  const [previousSalary, setPreviousSalary] = useState('');
  const [runningSalary, setRunningSalary] = useState('');
  const [previousELDays, setPreviousELDays] = useState('');
  const [runningELDays, setRunningELDays] = useState('');
  const [enterDays, setEnterDays] = useState('20');
  const [result, setResult] = useState<any>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const ps = parseFloat(previousSalary) || 0;
    const rs = parseFloat(runningSalary) || 0;
    const ped = parseInt(previousELDays) || 0;
    const red = parseInt(runningELDays) || 0;
    const ed = parseInt(enterDays) || 0;

    if (ps === 0 || rs === 0) return;

    const previousPerDay = ps / ed;
    const runningPerDay = rs / ed;
    
    const previousTotal = previousPerDay * ped;
    const runningTotal = runningPerDay * red;
    const total = previousTotal + runningTotal;

    setResult({
      previousPerDay: previousPerDay.toFixed(2),
      runningPerDay: runningPerDay.toFixed(2),
      previousTotal: previousTotal.toFixed(2),
      runningTotal: runningTotal.toFixed(2),
      total: total.toFixed(2)
    });
  };

  const handleClear = () => {
    setPreviousSalary('');
    setRunningSalary('');
    setPreviousELDays('');
    setRunningELDays('');
    setEnterDays('20');
    setResult(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCalculate} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Previous Salary:</label>
          <input type="number" value={previousSalary} onChange={(e) => setPreviousSalary(e.target.value)} placeholder="Enter Previous Salary" className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Running Salary:</label>
          <input type="number" value={runningSalary} onChange={(e) => setRunningSalary(e.target.value)} placeholder="Enter Running Salary" className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Previous EL Days:</label>
          <input type="number" value={previousELDays} onChange={(e) => setPreviousELDays(e.target.value)} placeholder="Enter Days" className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Running EL Days:</label>
          <input type="number" value={runningELDays} onChange={(e) => setRunningELDays(e.target.value)} placeholder="Enter Days" className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Enter Days:</label>
          <select value={enterDays} onChange={(e) => setEnterDays(e.target.value)} className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option value="20">20</option>
            <option value="26">26</option>
          </select>
        </div>

        <div className="col-span-2 lg:col-span-4 flex flex-row justify-center gap-2 sm:gap-4 mt-4">
          <button type="submit" className="flex-1 sm:flex-none px-2 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-l font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Calculator className="w-3.5 h-3.5 sm:w-5 h-5" />
            Calculate
          </button>
          <button type="button" onClick={handleClear} className="flex-1 sm:flex-none px-2 sm:px-8 py-2 sm:py-3 bg-red-500 text-white rounded-l font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Trash2 className="w-3.5 h-3.5 sm:w-5 h-5" />
            Clear
          </button>
          <button type="button" onClick={handlePrint} className="flex-1 sm:flex-none px-2 sm:px-8 py-2 sm:py-3 bg-slate-800 text-white rounded-l font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-100 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Printer className="w-3.5 h-3.5 sm:w-5 h-5" />
            Print
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Earned Result</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Previous Per Day:</span>
                <span className="font-bold text-slate-800">৳{result.previousPerDay}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Running Per Day:</span>
                <span className="font-bold text-slate-800">৳{result.runningPerDay}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Previous Total:</span>
                <span className="font-bold text-slate-800">৳{result.previousTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Running Total:</span>
                <span className="font-bold text-slate-800">৳{result.runningTotal}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                <span className="text-lg font-bold text-blue-600">Grand Total:</span>
                <span className="text-lg font-bold text-blue-600">৳{result.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
