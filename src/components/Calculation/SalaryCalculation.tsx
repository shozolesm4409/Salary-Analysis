import React, { useState } from 'react';
import { Calculator, Trash2, Printer } from 'lucide-react';

export default function SalaryCalculation() {
  const [employeeType, setEmployeeType] = useState('Select Type');
  const [salary, setSalary] = useState('');
  const [enterDays, setEnterDays] = useState('0');
  const [weekendDays, setWeekendDays] = useState('0');
  const [govtHolidays, setGovtHolidays] = useState('0');
  const [addEidBonus, setAddEidBonus] = useState(false);
  const [addMlssNasta, setAddMlssNasta] = useState(false);
  const [showExtraAmount, setShowExtraAmount] = useState(false);
  const [extraAmount, setExtraAmount] = useState('');
  const [showLunchBill, setShowLunchBill] = useState(false);
  const [lunchBillAmount, setLunchBillAmount] = useState('');
  const [showPettyCash, setShowPettyCash] = useState(false);
  const [pettyCashAmount, setPettyCashAmount] = useState('');
  const [showLeaveWithoutPay, setShowLeaveWithoutPay] = useState(false);
  const [leaveWithoutPayDays, setLeaveWithoutPayDays] = useState('');
  const [showAbsent, setShowAbsent] = useState(false);
  const [absentDays, setAbsentDays] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseFloat(salary) || 0;
    const ed = parseInt(enterDays) || 0;
    const wd = parseInt(weekendDays) || 0;
    const gh = parseInt(govtHolidays) || 0;
    const ea = parseFloat(extraAmount) || 0;
    const lb = parseFloat(lunchBillAmount) || 0;
    const pc = parseFloat(pettyCashAmount) || 0;
    const lwp = parseInt(leaveWithoutPayDays) || 0;
    const ad = parseInt(absentDays) || 0;

    if (s === 0 || ed === 0) return;

    const perDaySalary = s / ed;
    const workingDays = ed - wd - gh;
    const totalPayableDays = ed - lwp - ad;
    const baseSalary = perDaySalary * totalPayableDays;
    
    let bonus = 0;
    if (addEidBonus) bonus = s / 2;
    
    let nasta = 0;
    if (addMlssNasta) nasta = 500;

    const total = baseSalary + bonus + nasta + ea + lb - pc;

    setResult({
      perDaySalary: perDaySalary.toFixed(2),
      workingDays,
      totalPayableDays,
      baseSalary: baseSalary.toFixed(2),
      bonus: bonus.toFixed(2),
      nasta: nasta.toFixed(2),
      total: total.toFixed(2)
    });
  };

  const handleClear = () => {
    setEmployeeType('Select Type');
    setSalary('');
    setEnterDays('0');
    setWeekendDays('0');
    setGovtHolidays('0');
    setAddEidBonus(false);
    setAddMlssNasta(false);
    setShowExtraAmount(false);
    setExtraAmount('');
    setShowLunchBill(false);
    setLunchBillAmount('');
    setShowPettyCash(false);
    setPettyCashAmount('');
    setShowLeaveWithoutPay(false);
    setLeaveWithoutPayDays('');
    setShowAbsent(false);
    setAbsentDays('');
    setResult(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCalculate} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Calculation Type:</label>
          <select 
            value={employeeType}
            onChange={(e) => {
              setEmployeeType(e.target.value);
              if (e.target.value === 'Contractual' || e.target.value === 'Probation-1 Month') {
                setEnterDays('30');
              } else {
                setEnterDays('26');
              }
            }}
            className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option>Select Type</option>
            <option>Contractual</option>
            <option>Probation-1 Month</option>
            <option>Probation-2/6 Months</option>
            <option>Permanent</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Employee Salary:</label>
          <input 
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Enter Amounts"
            className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Enter Days:</label>
          <select 
            value={enterDays}
            onChange={(e) => setEnterDays(e.target.value)}
            className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="0">Select Days</option>
            {[26, 28, 29, 30, 31].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Weekend Days:</label>
          <select 
            value={weekendDays}
            onChange={(e) => setWeekendDays(e.target.value)}
            className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="0">Select Days</option>
            {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Govt Holidays:</label>
          <select 
            value={govtHolidays}
            onChange={(e) => setGovtHolidays(e.target.value)}
            className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="0">Select Days</option>
            {[1, 2, 3].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={addEidBonus} onChange={(e) => setAddEidBonus(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Add Eid Bonus
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={addMlssNasta} onChange={(e) => setAddMlssNasta(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Add MLSS Nasta
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showExtraAmount} onChange={(e) => setShowExtraAmount(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Add Extra Amount
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showLunchBill} onChange={(e) => setShowLunchBill(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Add Lunch Bill
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showPettyCash} onChange={(e) => setShowPettyCash(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Add Pettycash (IOU)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showLeaveWithoutPay} onChange={(e) => setShowLeaveWithoutPay(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Leave Without Pay
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showAbsent} onChange={(e) => setShowAbsent(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Add Absent Day
            </label>
          </div>
        </div>

        {showExtraAmount && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Extra Amount:</label>
            <input type="number" value={extraAmount} onChange={(e) => setExtraAmount(e.target.value)} placeholder="Enter Amount" className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        )}
        {showLunchBill && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Lunch Bill:</label>
            <input type="number" value={lunchBillAmount} onChange={(e) => setLunchBillAmount(e.target.value)} placeholder="Enter Amount" className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        )}
        {showPettyCash && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">PettyCash (IOU):</label>
            <input type="number" value={pettyCashAmount} onChange={(e) => setPettyCashAmount(e.target.value)} placeholder="Enter Amount" className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        )}
        {showLeaveWithoutPay && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Leave Without Pay:</label>
            <input type="number" value={leaveWithoutPayDays} onChange={(e) => setLeaveWithoutPayDays(e.target.value)} placeholder="Enter Days" className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        )}
        {showAbsent && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Absent Days:</label>
            <input type="number" value={absentDays} onChange={(e) => setAbsentDays(e.target.value)} placeholder="Enter Days" className="w-full h-11 px-2 rounded-l border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        )}

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
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Calculation Result</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Per Day Salary:</span>
                <span className="font-bold text-slate-800">৳{result.perDaySalary}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Working Days:</span>
                <span className="font-bold text-slate-800">{result.workingDays} Days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Payable Days:</span>
                <span className="font-bold text-slate-800">{result.totalPayableDays} Days</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Base Salary:</span>
                <span className="font-bold text-slate-800">৳{result.baseSalary}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Bonus:</span>
                <span className="font-bold text-slate-800">৳{result.bonus}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                <span className="text-lg font-bold text-blue-600">Total Payable:</span>
                <span className="text-lg font-bold text-blue-600">৳{result.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
