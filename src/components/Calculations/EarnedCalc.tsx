import React, { useState } from 'react';
import { Calculator, Trash2, Printer } from 'lucide-react';

interface EarnedCalcProps {
  handlePrint: () => void;
}

export default function EarnedCalc({ handlePrint }: EarnedCalcProps) {
  const [previousSalary, setPreviousSalary] = useState('');
  const [runningSalary, setRunningSalary] = useState('');
  const [previousELDays, setPreviousELDays] = useState('');
  const [runningELDays, setRunningELDays] = useState('');
  const [enterDays, setEnterDays] = useState('20');
  const [result, setResult] = useState<React.ReactNode | null>(null);

  const handleClear = () => {
    setPreviousSalary('');
    setRunningSalary('');
    setPreviousELDays('');
    setRunningELDays('');
    setEnterDays('20');
    setResult(null);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const pSal = parseFloat(previousSalary) || 0;
    const rSal = parseFloat(runningSalary) || 0;
    const pDays = parseFloat(previousELDays) || 0;
    const rDays = parseFloat(runningELDays) || 0;
    const eDays = parseInt(enterDays) || 20;

    if (!previousSalary || !runningSalary) {
      alert("💰 Please enter both Previous and Running Salary amounts.");
      return;
    }

    const psalary60 = pSal * 0.6;
    const rsalary60 = rSal * 0.6;
    const previousELAmount = (psalary60 / eDays) * pDays * 1.5;
    const runningELAmount = (rsalary60 / eDays) * rDays * 1.5;
    const onepelamount = (pSal * 0.6 / eDays * 1.5).toFixed(2);
    const onerelamount = (rSal * 0.6 / eDays * 1.5).toFixed(2);
    const totalELAmount = previousELAmount + runningELAmount;

    setResult(
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-blue-700">Earned Leave Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-blue-200">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-1 border border-blue-300">Field Type</th>
                <th className="p-1 border border-blue-300">Summary Details</th>
                <th className="p-1 border border-blue-300">Per Leave Amount</th>
                <th className="p-1 border border-blue-300">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 border border-blue-200">Previous EL Amount</td>
                <td className="p-1 border border-blue-200">Previous EL Days = {pDays}</td>
                <td className="p-1 border border-blue-200">{onepelamount}</td>
                <td className="p-1 border border-blue-200">{previousELAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="p-1 border border-blue-200">Running EL Amount</td>
                <td className="p-1 border border-blue-200">Running EL Days = {rDays}</td>
                <td className="p-1 border border-blue-200">{onerelamount}</td>
                <td className="p-1 border border-blue-200">{runningELAmount.toFixed(2)}</td>
              </tr>
              <tr className="bg-blue-600 text-white font-bold">
                <td colSpan={3} className="p-1 border border-blue-300">Total EL Amount</td>
                <td className="p-1 border border-blue-300">{totalELAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3">
      <form onSubmit={handleCalculate} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Previous Salary:</label>
          <input type="number" value={previousSalary} onChange={(e) => setPreviousSalary(e.target.value)} placeholder="Enter Previous Salary" className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Running Salary:</label>
          <input type="number" value={runningSalary} onChange={(e) => setRunningSalary(e.target.value)} placeholder="Enter Running Salary" className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Previous EL Days:</label>
          <input type="number" value={previousELDays} onChange={(e) => setPreviousELDays(e.target.value)} placeholder="Enter Days" className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Running EL Days:</label>
          <input type="number" value={runningELDays} onChange={(e) => setRunningELDays(e.target.value)} placeholder="Enter Days" className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Enter Days:</label>
          <select value={enterDays} onChange={(e) => setEnterDays(e.target.value)} className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option value="20">20</option>
            <option value="26">26</option>
          </select>
        </div>

        <div className="col-span-2 lg:col-span-4 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-6">
          <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 text-sm sm:text-base">
            <Calculator className="w-5 h-5" />
            Calculate
          </button>
          <button type="button" onClick={handleClear} className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 text-sm sm:text-base">
            <Trash2 className="w-5 h-5" />
            Clear
          </button>
          <button type="button" onClick={handlePrint} className="w-full sm:w-auto px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-100 flex items-center justify-center gap-2 text-sm sm:text-base">
            <Printer className="w-5 h-5" />
            Print
          </button>
        </div>
      </form>

      <div className="mt-10">
        {result}
      </div>
    </div>
  );
}
