import React, { useState } from 'react';
import { Calculator, Trash2, Printer } from 'lucide-react';

interface SalaryCalcProps {
  handlePrint: () => void;
}

export default function SalaryCalc({ handlePrint }: SalaryCalcProps) {
  const [employeeType, setEmployeeType] = useState('Select Type');
  const [salary, setSalary] = useState('');
  const [enterDays, setEnterDays] = useState('0');
  const [weekendDays, setWeekendDays] = useState('0');
  const [govtHolidays, setGovtHolidays] = useState('0');
  
  const [showExtraAmount, setShowExtraAmount] = useState(false);
  const [showLunchBill, setShowLunchBill] = useState(false);
  const [showPettyCash, setShowPettyCash] = useState(false);
  const [showLeaveWithoutPay, setShowLeaveWithoutPay] = useState(false);
  const [showAbsent, setShowAbsent] = useState(false);
  const [addEidBonus, setAddEidBonus] = useState(false);
  const [addMlssNasta, setAddMlssNasta] = useState(false);

  const [extraAmount, setExtraAmount] = useState('');
  const [lunchBillAmount, setLunchBillAmount] = useState('');
  const [pettyCashAmount, setPettyCashAmount] = useState('');
  const [leaveWithoutPayDays, setLeaveWithoutPayDays] = useState('');
  const [absentDays, setAbsentDays] = useState('');

  const [result, setResult] = useState<React.ReactNode | null>(null);

  const handleClear = () => {
    setEmployeeType('Select Type');
    setSalary('');
    setEnterDays('0');
    setWeekendDays('0');
    setGovtHolidays('0');
    setShowExtraAmount(false);
    setShowLunchBill(false);
    setShowPettyCash(false);
    setShowLeaveWithoutPay(false);
    setShowAbsent(false);
    setAddEidBonus(false);
    setAddMlssNasta(false);
    setExtraAmount('');
    setLunchBillAmount('');
    setPettyCashAmount('');
    setLeaveWithoutPayDays('');
    setAbsentDays('');
    setResult(null);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeType === 'Select Type') {
      alert("⚠️ Please select a valid Employee Type.");
      return;
    }
    const empSalary = parseFloat(salary) || 0;
    const eDays = parseInt(enterDays) || 0;
    const wDays = parseInt(weekendDays) || 0;
    const gHols = parseInt(govtHolidays) || 0;
    const lBill = parseFloat(lunchBillAmount) || 0;
    const exAmt = parseFloat(extraAmount) || 0;
    const pCash = parseFloat(pettyCashAmount) || 0;
    const lwp = parseFloat(leaveWithoutPayDays) || 0;
    const abs = parseFloat(absentDays) || 0;

    if (!salary) {
      alert("💰 Please enter a valid Employee Salary.");
      return;
    }

    const salary60 = empSalary * 0.6;
    const salary40 = empSalary * 0.4;
    
    let calc1, calc2, calc3, calc4, calc5, calc6;
    if (employeeType === "Contractual" || employeeType === "Probation-1 Month" || employeeType === "Probation-2/6 Months") {
      calc1 = (empSalary / eDays) * wDays;
      calc2 = ((empSalary / eDays) * 1.5) * gHols;
      calc3 = empSalary / eDays;
      calc4 = ((empSalary / eDays) * 1.5);
      calc5 = ((empSalary / eDays) * lwp);
      calc6 = ((empSalary / eDays) * abs * 1.5);
    } else { // Permanent
      calc1 = (salary60 / eDays) * wDays;
      calc2 = ((salary60 / eDays) * 1.5) * gHols;
      calc3 = salary60 / eDays;
      calc4 = ((salary60 / eDays) * 1.5);
      calc5 = ((salary60 / eDays) * lwp);
      calc6 = ((salary60 / eDays) * abs * 1.5);
    }

    const subTotal = salary60 + salary40;
    const orgSaving = employeeType === "Permanent" ? empSalary * 0.03 : 0;
    const totalSalary = subTotal - lBill - pCash - calc5 - calc6 - orgSaving;
    const excludedAmount = lBill + pCash + orgSaving + calc5 + calc6;
    
    let grandTotal = totalSalary + exAmt + calc1 + calc2;
    let eidBonusAmount = 0;
    if (addEidBonus) {
      if (employeeType === "Contractual") eidBonusAmount = empSalary * 0.30;
      else if (employeeType === "Probation-1 Month" || employeeType === "Probation-2/6 Months") eidBonusAmount = empSalary * 0.40;
      else if (employeeType === "Permanent") eidBonusAmount = empSalary * 0.60;
      grandTotal += eidBonusAmount;
    }

    let nastaAmount = 0;
    if (addMlssNasta) {
      nastaAmount = (eDays + wDays) * 20;
      grandTotal += nastaAmount;
    }

    const includedAmount = eidBonusAmount + nastaAmount + exAmt + calc1 + calc2;

    setResult(
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-blue-700">Salary Calculation Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-blue-200">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-1 border border-blue-300">Field Type</th>
                <th className="p-1 border border-blue-300">Summary Details</th>
                <th className="p-1 border border-blue-300">Per Day Amount</th>
                <th className="p-1 border border-blue-300">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 border border-blue-200">Employee Salary</td>
                <td className="p-1 border border-blue-200">1 Day = {calc3.toFixed(2)}</td>
                <td className="p-1 border border-blue-200">1 Govt. Holiday = {calc4.toFixed(2)}</td>
                <td className="p-1 border border-blue-200">{empSalary.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="p-1 border border-blue-200">Enter Days</td>
                <td className="p-1 border border-blue-200">Days = {eDays}</td>
                <td className="p-1 border border-blue-200">Basic Salary</td>
                <td className="p-1 border border-blue-200">{salary60.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="p-1 border border-blue-200">Employee Type</td>
                <td className="p-1 border border-blue-200">{employeeType}</td>
                <td className="p-1 border border-blue-200">Extra Salary</td>
                <td className="p-1 border border-blue-200">{salary40.toFixed(2)}</td>
              </tr>
              <tr className="bg-blue-50 font-bold">
                <td colSpan={3} className="p-1 border border-blue-200">Salary Amount</td>
                <td className="p-1 border border-blue-200">{subTotal.toFixed(2)}</td>
              </tr>
              <tr className="bg-slate-100 font-bold text-center">
                <td colSpan={4} className="p-1 border border-blue-200">Adjustments</td>
              </tr>
              {wDays > 0 && (
                <tr>
                  <td className="p-1 border border-blue-200">Weekend Days</td>
                  <td colSpan={2} className="p-1 border border-blue-200">Included Total Weekend = {wDays}</td>
                  <td className="p-1 border border-blue-200">{calc1.toFixed(2)}</td>
                </tr>
              )}
              {gHols > 0 && (
                <tr>
                  <td className="p-1 border border-blue-200">Govt Holidays</td>
                  <td colSpan={2} className="p-1 border border-blue-200">Included Total Govt. Holidays = {gHols}</td>
                  <td className="p-1 border border-blue-200">{calc2.toFixed(2)}</td>
                </tr>
              )}
              {addEidBonus && (
                <tr>
                  <td className="p-1 border border-blue-200">Eid Bonus</td>
                  <td colSpan={2} className="p-1 border border-blue-200">Included to Total Salary</td>
                  <td className="p-1 border border-blue-200">{eidBonusAmount.toFixed(2)}</td>
                </tr>
              )}
              {addMlssNasta && (
                <tr>
                  <td className="p-1 border border-blue-200">MLSS Nasta</td>
                  <td colSpan={2} className="p-1 border border-blue-200">Included EnterDay + Weekend = {(eDays + wDays)} x 20</td>
                  <td className="p-1 border border-blue-200">{nastaAmount.toFixed(2)}</td>
                </tr>
              )}
              {exAmt > 0 && (
                <tr>
                  <td className="p-1 border border-blue-200">Extra Amount</td>
                  <td colSpan={2} className="p-1 border border-blue-200">Included Children Allowance/Increment</td>
                  <td className="p-1 border border-blue-200">{exAmt.toFixed(2)}</td>
                </tr>
              )}
              {includedAmount > 0 && (
                <tr className="bg-green-50 text-green-700 font-bold">
                  <td colSpan={3} className="p-1 border border-blue-200">Included amount = Added to the Total salary.</td>
                  <td className="p-1 border border-blue-200">{includedAmount.toFixed(2)}</td>
                </tr>
              )}
              {lBill > 0 && (
                <tr>
                  <td className="p-1 border border-blue-200">Lunch Bill</td>
                  <td colSpan={2} className="p-1 border border-blue-200">Excluded from Total Salary</td>
                  <td className="p-1 border border-blue-200">-{lBill.toFixed(2)}</td>
                </tr>
              )}
              {pCash > 0 && (
                <tr>
                  <td className="p-1 border border-blue-200">PettyCash (IOU) Amount</td>
                  <td colSpan={2} className="p-1 border border-blue-200">Excluded from Total Salary</td>
                  <td className="p-1 border border-blue-200">-{pCash.toFixed(2)}</td>
                </tr>
              )}
              {employeeType === "Permanent" && (
                <tr>
                  <td className="p-1 border border-blue-200">ORG Saving</td>
                  <td colSpan={2} className="p-1 border border-blue-200">Excluded (Basic 5%) from Total Salary</td>
                  <td className="p-1 border border-blue-200">-{orgSaving.toFixed(2)}</td>
                </tr>
              )}
              {lwp > 0 && (
                <tr>
                  <td className="p-1 border border-blue-200">Leave Without Pay Amount</td>
                  <td colSpan={2} className="p-1 border border-blue-200">Excluded (1x = {calc3.toFixed(2)}) from Total Salary = {lwp}</td>
                  <td className="p-1 border border-blue-200">-{calc5.toFixed(2)}</td>
                </tr>
              )}
              {abs > 0 && (
                <tr>
                  <td className="p-1 border border-blue-200">Absent Amount</td>
                  <td colSpan={2} className="p-1 border border-blue-200">Excluded (1.5x = {calc4.toFixed(2)}) from Total Salary = {abs}</td>
                  <td className="p-1 border border-blue-200">-{calc6.toFixed(2)}</td>
                </tr>
              )}
              {excludedAmount > 0 && (
                <tr className="bg-red-50 text-red-700 font-bold">
                  <td colSpan={3} className="p-1 border border-blue-200">Excluded Amount = Excluded from the Total salary.</td>
                  <td className="p-1 border border-blue-200">-{excludedAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="bg-blue-600 text-white font-bold">
                <td colSpan={3} className="p-1 border border-blue-300">Total Salary</td>
                <td className="p-1 border border-blue-300">{grandTotal.toFixed(2)}</td>
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
            className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
            className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Enter Days:</label>
          <select 
            value={enterDays}
            onChange={(e) => setEnterDays(e.target.value)}
            className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
            className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
            className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
            <input type="number" value={extraAmount} onChange={(e) => setExtraAmount(e.target.value)} placeholder="Enter Amount" className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        )}
        {showLunchBill && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Lunch Bill:</label>
            <input type="number" value={lunchBillAmount} onChange={(e) => setLunchBillAmount(e.target.value)} placeholder="Enter Amount" className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        )}
        {showPettyCash && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">PettyCash (IOU):</label>
            <input type="number" value={pettyCashAmount} onChange={(e) => setPettyCashAmount(e.target.value)} placeholder="Enter Amount" className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        )}
        {showLeaveWithoutPay && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Leave Without Pay:</label>
            <input type="number" value={leaveWithoutPayDays} onChange={(e) => setLeaveWithoutPayDays(e.target.value)} placeholder="Enter Days" className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        )}
        {showAbsent && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Absent Days:</label>
            <input type="number" value={absentDays} onChange={(e) => setAbsentDays(e.target.value)} placeholder="Enter Days" className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        )}

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
