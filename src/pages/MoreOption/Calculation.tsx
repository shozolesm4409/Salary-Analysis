import React, { useState, useEffect } from 'react';
import { Calculator, ChevronDown, ChevronUp, Printer, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

type CalculationType = 'Salary' | 'Earned' | 'Increment' | 'Working Hour';

interface IncrementData {
  month: string;
  iAmount: string;
  workingDays: string;
  weekend: string | number;
  wAmount: string;
  gHoliday: string | number;
  ghAmount: string;
  eidBonus: string;
  subTotal: string;
  orgSaving: string;
  totalAmount: string;
}

interface IncrementResult {
  data: IncrementData[];
  totals: IncrementData;
  additionalTable: {
    amount: string;
    basicAmount: string;
    extraAmount: string;
    oneWeekend: string;
    oneGovtHoliday: string;
    eidBonus: string;
  };
}

export default function Calculation() {
  const [activeType, setActiveType] = useState<CalculationType>('Salary');
  const [employeeType, setEmployeeType] = useState('Select Type');
  const [salary, setSalary] = useState('');
  const [enterDays, setEnterDays] = useState('0');
  const [weekendDays, setWeekendDays] = useState('0');
  const [govtHolidays, setGovtHolidays] = useState('0');
  
  // Checkboxes
  const [showExtraAmount, setShowExtraAmount] = useState(false);
  const [showLunchBill, setShowLunchBill] = useState(false);
  const [showPettyCash, setShowPettyCash] = useState(false);
  const [showLeaveWithoutPay, setShowLeaveWithoutPay] = useState(false);
  const [showAbsent, setShowAbsent] = useState(false);
  const [addEidBonus, setAddEidBonus] = useState(false);
  const [addMlssNasta, setAddMlssNasta] = useState(false);

  // Amounts
  const [extraAmount, setExtraAmount] = useState('');
  const [lunchBillAmount, setLunchBillAmount] = useState('');
  const [pettyCashAmount, setPettyCashAmount] = useState('');
  const [leaveWithoutPayDays, setLeaveWithoutPayDays] = useState('');
  const [absentDays, setAbsentDays] = useState('');

  // Earned Leave
  const [previousSalary, setPreviousSalary] = useState('');
  const [runningSalary, setRunningSalary] = useState('');
  const [previousELDays, setPreviousELDays] = useState('');
  const [runningELDays, setRunningELDays] = useState('');

  // Increment
  const [incrementAmount, setIncrementAmount] = useState('');
  const [totalMonths, setTotalMonths] = useState('--Select--');
  const [eidBonusSelect, setEidBonusSelect] = useState('');
  const [incrementResult, setIncrementResult] = useState<IncrementResult | null>(null);

  // Working Hour
  const [workingHours, setWorkingHours] = useState<Record<string, { hour: string; day: string }>>({
    jan: { hour: '', day: '' },
    feb: { hour: '', day: '' },
    mar: { hour: '', day: '' },
    apr: { hour: '', day: '' },
    may: { hour: '', day: '' },
    jun: { hour: '', day: '' },
    jul: { hour: '', day: '' },
    aug: { hour: '', day: '' },
    sep: { hour: '', day: '' },
    oct: { hour: '', day: '' },
    nov: { hour: '', day: '' },
    dec: { hour: '', day: '' },
  });

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
    setPreviousSalary('');
    setRunningSalary('');
    setPreviousELDays('');
    setRunningELDays('');
    setIncrementAmount('');
    setTotalMonths('--Select--');
    setEidBonusSelect('');
    setIncrementResult(null);
    setResult(null);
    setWorkingHours(Object.keys(workingHours).reduce((acc, key) => ({ ...acc, [key]: { hour: '', day: '' } }), {}));
  };

  const calculateIncrement = (amount: number, monthsCount: number, days: number, bonusType: number) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].slice(0, monthsCount);
    const data: IncrementData[] = [];

    for (let i = 0; i < monthsCount; i++) {
      const iAmount = amount;
      const weekend = 0; // Default or from state if implemented
      const gHoliday = 0; // Default or from state if implemented
      
      const wAmount = weekend > 0 ? (iAmount * 0.6 / days * weekend) : 0;
      const ghAmount = gHoliday > 0 ? (iAmount * 0.9 / days * gHoliday) : 0;
      const eidBonusAmount = (bonusType === 1 || bonusType === 2) && (i < bonusType) ? iAmount * 0.6 : 0;
      
      const subTotal = iAmount + wAmount + ghAmount + eidBonusAmount;
      const orgSaving = iAmount * 0.03;
      const totalAmount = subTotal - orgSaving;

      data.push({
        month: months[i],
        iAmount: iAmount.toFixed(0),
        workingDays: days.toFixed(0),
        weekend: weekend !== 0 ? weekend : "",
        wAmount: wAmount ? wAmount.toFixed(2) : "",
        gHoliday: gHoliday !== 0 ? gHoliday : "",
        ghAmount: ghAmount ? ghAmount.toFixed(2) : "",
        eidBonus: eidBonusAmount ? eidBonusAmount.toFixed(0) : "",
        subTotal: subTotal.toFixed(2),
        orgSaving: orgSaving.toFixed(0),
        totalAmount: totalAmount.toFixed(2)
      });
    }

    const totals: IncrementData = {
      month: "Total",
      iAmount: data.reduce((sum, row) => sum + parseFloat(row.iAmount), 0).toFixed(0),
      workingDays: (days * monthsCount).toFixed(0),
      weekend: data.reduce((sum, row) => sum + (parseFloat(row.weekend as string) || 0), 0).toFixed(2),
      wAmount: data.reduce((sum, row) => sum + (parseFloat(row.wAmount) || 0), 0).toFixed(2),
      gHoliday: data.reduce((sum, row) => sum + (parseFloat(row.gHoliday as string) || 0), 0).toFixed(2),
      ghAmount: data.reduce((sum, row) => sum + (parseFloat(row.ghAmount) || 0), 0).toFixed(2),
      eidBonus: data.reduce((sum, row) => sum + (parseFloat(row.eidBonus) || 0), 0).toFixed(0),
      subTotal: data.reduce((sum, row) => sum + parseFloat(row.subTotal), 0).toFixed(2),
      orgSaving: data.reduce((sum, row) => sum + parseFloat(row.orgSaving), 0).toFixed(0),
      totalAmount: data.reduce((sum, row) => sum + parseFloat(row.totalAmount), 0).toFixed(2)
    };

    const additionalTable = {
      amount: amount.toFixed(0),
      basicAmount: (amount * 0.6).toFixed(0),
      extraAmount: (amount * 0.4).toFixed(0),
      oneWeekend: ((amount * 0.6) / days).toFixed(0),
      oneGovtHoliday: ((amount * 0.6) / days * 1.5).toFixed(0),
      eidBonus: (amount * 0.6).toFixed(0),
    };

    return { data, totals, additionalTable };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === 'Salary') {
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
    } else if (activeType === 'Earned') {
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
    } else if (activeType === 'Increment') {
      const amt = parseFloat(incrementAmount) || 0;
      const months = parseInt(totalMonths) || 0;
      const days = parseInt(enterDays) || 26;
      const bonus = parseInt(eidBonusSelect) || 0;

      if (!incrementAmount || totalMonths === "--Select--" || !enterDays) {
        alert("Amount, Total Months এবং Enter Days পূরণ করুন।");
        return;
      }

      const res = calculateIncrement(amt, months, days, bonus);
      setIncrementResult(res);
    }
  };

  const handleDownload = () => {
    const table = document.querySelector('table');
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, 'Calculation_Result.xlsx');
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateWorkingHourAverage = (month: string) => {
    const data = workingHours[month];
    let totalMinutes = 0;
    if (data.hour.includes(':')) {
      const [h, m] = data.hour.split(':').map(val => parseInt(val) || 0);
      totalMinutes = (h * 60) + m;
    } else {
      totalMinutes = (parseFloat(data.hour) || 0) * 60;
    }
    const days = parseFloat(data.day) || 0;
    if (days === 0) return '0h 0m';
    const avgMinutes = totalMinutes / days;
    const h = Math.floor(avgMinutes / 60);
    const m = Math.round(avgMinutes % 60);
    return `${h}h ${m}m`;
  };

  const getWorkingHourTotals = () => {
    let totalMinutes = 0;
    let totalDays = 0;
    Object.values(workingHours).forEach((data: { hour: string; day: string }) => {
      let mins = 0;
      if (data.hour.includes(':')) {
        const [h, m] = data.hour.split(':').map(val => parseInt(val) || 0);
        mins = (h * 60) + m;
      } else {
        mins = (parseFloat(data.hour) || 0) * 60;
      }
      totalMinutes += mins;
      totalDays += parseFloat(data.day) || 0;
    });

    const totalHours = (totalMinutes / 60).toFixed(2);
    const avgMinutes = totalDays > 0 ? totalMinutes / totalDays : 0;
    const h = Math.floor(avgMinutes / 60);
    const m = Math.round(avgMinutes % 60);
    
    return {
      hours: totalHours,
      days: totalDays.toFixed(2),
      avg: `${h}h ${m}m`
    };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-nowrap overflow-x-auto gap-2 justify-center no-scrollbar">
            {(['Salary', 'Earned', 'Increment', 'Working Hour'] as CalculationType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setActiveType(type);
                  handleClear();
                }}
                className={cn(
                  "px-3 sm:px-6 py-1.5 sm:py-2 rounded-l text-[10px] sm:text-sm font-semibold transition-all shadow-sm whitespace-nowrap",
                  activeType === type
                    ? "bg-blue-600 text-white shadow-blue-200"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                )}
              >
                {type}
              </button>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-center mt-3 text-slate-800">
            {activeType} Calculation
          </h2>
        </div>

        <div className="p-3">
          <form onSubmit={handleCalculate} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {activeType === 'Salary' && (
              <>
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
              </>
            )}

            {activeType === 'Earned' && (
              <>
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
              </>
            )}

            {activeType === 'Increment' && (
              <>
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
              </>
            )}

            {activeType !== 'Working Hour' && (
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
            )}
          </form>

          {activeType === 'Working Hour' && (
            <div className="mt-8 space-y-6">
              <div className="overflow-x-auto rounded-l border border-slate-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="p-3 text-left">Month Name</th>
                      <th className="p-3 text-center">Working Hours</th>
                      <th className="p-3 text-center">Working Days</th>
                      <th className="p-3 text-center">Monthly hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(workingHours).map(([month, data]: [string, { hour: string; day: string }]) => (
                      <tr key={month} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-medium text-slate-700 capitalize">{month}</td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            value={data.hour}
                            onChange={(e) => setWorkingHours(prev => ({ ...prev, [month]: { ...prev[month], hour: e.target.value } }))}
                            placeholder="HH:MM"
                            className="w-24 h-9 px-2 text-center rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={data.day}
                            onChange={(e) => setWorkingHours(prev => ({ ...prev, [month]: { ...prev[month], day: e.target.value } }))}
                            className="w-24 h-9 px-2 text-center rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </td>
                        <td className="p-3 text-center font-semibold text-slate-600">
                          {calculateWorkingHourAverage(month)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold text-slate-800">
                      <td className="p-3">Total</td>
                      <td className="p-3 text-center">{getWorkingHourTotals().hours}</td>
                      <td className="p-3 text-center">{getWorkingHourTotals().days}</td>
                      <td className="p-3 text-center">{getWorkingHourTotals().avg}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center gap-2 sm:gap-4">
                <button onClick={handleClear} className="flex-1 sm:flex-none px-4 sm:px-8 py-2 sm:py-3 bg-red-500 text-white rounded-l font-bold hover:bg-red-600 transition-all text-xs sm:text-sm">Clear</button>
                <button onClick={handlePrint} className="flex-1 sm:flex-none px-4 sm:px-8 py-2 sm:py-3 bg-slate-800 text-white rounded-l font-bold hover:bg-slate-900 transition-all text-xs sm:text-sm">Print</button>
              </div>
            </div>
          )}

          <div className="mt-10">
            {result}
            {incrementResult && (
              <div className="space-y-10">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800">Amount Summary</h3>
                  <div className="overflow-x-auto rounded-l border border-slate-200">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="p-3">Increment Amount</th>
                          <th className="p-3">Basic Amount</th>
                          <th className="p-3">Extra Amount</th>
                          <th className="p-3">1 Weekend</th>
                          <th className="p-3">1 Govt. Holiday</th>
                          <th className="p-3">Eid Bonus</th>
                          <th className="p-3">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-center font-medium">
                          <td className="p-3 border border-slate-100">{incrementResult.additionalTable.amount}</td>
                          <td className="p-3 border border-slate-100">{incrementResult.additionalTable.basicAmount}</td>
                          <td className="p-3 border border-slate-100">{incrementResult.additionalTable.extraAmount}</td>
                          <td className="p-3 border border-slate-100">{incrementResult.additionalTable.oneWeekend}</td>
                          <td className="p-3 border border-slate-100">{incrementResult.additionalTable.oneGovtHoliday}</td>
                          <td className="p-3 border border-slate-100">{incrementResult.additionalTable.eidBonus}</td>
                          <td className="p-3 border border-slate-100 font-bold text-blue-600">{incrementResult.totals.totalAmount}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800">Monthly Increment Summary</h3>
                  <div className="overflow-x-auto rounded-l border border-slate-200">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-600 text-white text-xs uppercase tracking-wider">
                          <th className="p-3">Month</th>
                          <th className="p-3">I. Amount</th>
                          <th className="p-3">Working Days</th>
                          <th className="p-3">Weekend</th>
                          <th className="p-3">W.Amount</th>
                          <th className="p-3">G. Holiday</th>
                          <th className="p-3">G.H Amount</th>
                          <th className="p-3">Eid Bonus</th>
                          <th className="p-3">Sub-Total</th>
                          <th className="p-3">Org Saving</th>
                          <th className="p-3">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {incrementResult.data.map((row, idx) => (
                          <tr key={idx} className="text-center text-sm hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-medium text-slate-700">{row.month}</td>
                            <td className="p-3">{row.iAmount}</td>
                            <td className="p-3">{row.workingDays}</td>
                            <td className="p-3">
                              <input 
                                type="text" 
                                value={row.weekend} 
                                onChange={(e) => {
                                  if (!incrementResult) return;
                                  const newData = [...incrementResult.data];
                                  const val = e.target.value;
                                  newData[idx].weekend = val;
                                  
                                  const iAmt = parseFloat(newData[idx].iAmount) || 0;
                                  const days = parseFloat(newData[idx].workingDays) || 26;
                                  const weekend = parseFloat(val) || 0;
                                  const gHoliday = parseFloat(newData[idx].gHoliday as string) || 0;
                                  const eidBonus = parseFloat(newData[idx].eidBonus) || 0;
                                  
                                  const wAmount = (iAmt * 0.6 / days * weekend);
                                  const ghAmount = (iAmt * 0.9 / days * gHoliday);
                                  const subTotal = iAmt + wAmount + ghAmount + eidBonus;
                                  const orgSaving = iAmt * 0.03;
                                  const totalAmount = subTotal - orgSaving;
                                  
                                  newData[idx].wAmount = wAmount.toFixed(2);
                                  newData[idx].ghAmount = ghAmount.toFixed(2);
                                  newData[idx].subTotal = subTotal.toFixed(2);
                                  newData[idx].orgSaving = orgSaving.toFixed(0);
                                  newData[idx].totalAmount = totalAmount.toFixed(2);
                                  
                                  const totals = {...incrementResult.totals};
                                  totals.weekend = newData.reduce((sum, r) => sum + (parseFloat(r.weekend as string) || 0), 0).toFixed(2);
                                  totals.wAmount = newData.reduce((sum, r) => sum + (parseFloat(r.wAmount) || 0), 0).toFixed(2);
                                  totals.subTotal = newData.reduce((sum, r) => sum + parseFloat(r.subTotal), 0).toFixed(2);
                                  totals.totalAmount = newData.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0).toFixed(2);

                                  setIncrementResult({...incrementResult, data: newData, totals});
                                }}
                                className="w-12 h-8 text-center border border-slate-200 rounded" 
                              />
                            </td>
                            <td className="p-3">{row.wAmount}</td>
                            <td className="p-3">
                              <input 
                                type="text" 
                                value={row.gHoliday} 
                                onChange={(e) => {
                                  if (!incrementResult) return;
                                  const newData = [...incrementResult.data];
                                  const val = e.target.value;
                                  newData[idx].gHoliday = val;
                                  
                                  const iAmt = parseFloat(newData[idx].iAmount) || 0;
                                  const days = parseFloat(newData[idx].workingDays) || 26;
                                  const weekend = parseFloat(newData[idx].weekend as string) || 0;
                                  const gHoliday = parseFloat(val) || 0;
                                  const eidBonus = parseFloat(newData[idx].eidBonus) || 0;
                                  
                                  const wAmount = (iAmt * 0.6 / days * weekend);
                                  const ghAmount = (iAmt * 0.9 / days * gHoliday);
                                  const subTotal = iAmt + wAmount + ghAmount + eidBonus;
                                  const orgSaving = iAmt * 0.03;
                                  const totalAmount = subTotal - orgSaving;
                                  
                                  newData[idx].wAmount = wAmount.toFixed(2);
                                  newData[idx].ghAmount = ghAmount.toFixed(2);
                                  newData[idx].subTotal = subTotal.toFixed(2);
                                  newData[idx].orgSaving = orgSaving.toFixed(0);
                                  newData[idx].totalAmount = totalAmount.toFixed(2);
                                  
                                  const totals = {...incrementResult.totals};
                                  totals.gHoliday = newData.reduce((sum, r) => sum + (parseFloat(r.gHoliday as string) || 0), 0).toFixed(2);
                                  totals.ghAmount = newData.reduce((sum, r) => sum + (parseFloat(r.ghAmount) || 0), 0).toFixed(2);
                                  totals.subTotal = newData.reduce((sum, r) => sum + parseFloat(r.subTotal), 0).toFixed(2);
                                  totals.totalAmount = newData.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0).toFixed(2);

                                  setIncrementResult({...incrementResult, data: newData, totals});
                                }}
                                className="w-12 h-8 text-center border border-slate-200 rounded" 
                              />
                            </td>
                            <td className="p-3">{row.ghAmount}</td>
                            <td className="p-3">{row.eidBonus}</td>
                            <td className="p-3">{row.subTotal}</td>
                            <td className="p-3">{row.orgSaving}</td>
                            <td className="p-3 font-semibold">{row.totalAmount}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-800 text-white font-bold text-sm">
                          <td className="p-3">Total</td>
                          <td className="p-3">{incrementResult.totals.iAmount}</td>
                          <td className="p-3">{incrementResult.totals.workingDays}</td>
                          <td className="p-3"></td>
                          <td className="p-3">{incrementResult.totals.wAmount}</td>
                          <td className="p-3"></td>
                          <td className="p-3">{incrementResult.totals.ghAmount}</td>
                          <td className="p-3">{incrementResult.totals.eidBonus}</td>
                          <td className="p-3">{incrementResult.totals.subTotal}</td>
                          <td className="p-3">{incrementResult.totals.orgSaving}</td>
                          <td className="p-3">{incrementResult.totals.totalAmount}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
