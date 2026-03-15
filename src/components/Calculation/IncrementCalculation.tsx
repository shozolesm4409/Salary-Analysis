import React, { useState } from 'react';
import { Calculator, Trash2, Printer } from 'lucide-react';

export default function IncrementCalculation() {
  const [incrementAmount, setIncrementAmount] = useState('');
  const [totalMonths, setTotalMonths] = useState('--Select--');
  const [enterDays, setEnterDays] = useState('26');
  const [eidBonusSelect, setEidBonusSelect] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const ia = parseFloat(incrementAmount) || 0;
    const tm = parseInt(totalMonths) || 0;
    const eb = parseInt(eidBonusSelect) || 0;

    if (ia === 0 || tm === 0) return;

    const totalIncrement = ia * tm;
    const bonusIncrement = eb * (ia / 2);
    const grandTotal = totalIncrement + bonusIncrement;

    setResult({
      totalIncrement: totalIncrement.toFixed(2),
      bonusIncrement: bonusIncrement.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    });
  };

  const handleClear = () => {
    setIncrementAmount('');
    setTotalMonths('--Select--');
    setEnterDays('26');
    setEidBonusSelect('');
    setResult(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCalculate} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Increment Amount:</label>
          <input type="number" value={incrementAmount} onChange={(e) => setIncrementAmount(e.target.value)} placeholder="Enter Amount" className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Total Months:</label>
          <select value={totalMonths} onChange={(e) => setTotalMonths(e.target.value)} className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option value="--Select--">--Select--</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Enter Days:</label>
          <select value={enterDays} onChange={(e) => setEnterDays(e.target.value)} className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option value="26">26</option>
            <option value="30">30</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Eid Bonus:</label>
          <select value={eidBonusSelect} onChange={(e) => setEidBonusSelect(e.target.value)} className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option value="">--Select--</option>
            <option value="1">1</option>
            <option value="2">2</option>
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
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Increment Result</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Monthly Increment:</span>
                <span className="font-bold text-slate-800">৳{result.totalIncrement}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Bonus Increment:</span>
                <span className="font-bold text-slate-800">৳{result.bonusIncrement}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                <span className="text-lg font-bold text-blue-600">Grand Total:</span>
                <span className="text-lg font-bold text-blue-600">৳{result.grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
