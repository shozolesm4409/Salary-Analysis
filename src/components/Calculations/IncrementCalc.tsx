import React, { useState } from 'react';
import { Calculator, Trash2, Printer } from 'lucide-react';

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

interface IncrementCalcProps {
  handlePrint: () => void;
}

export default function IncrementCalc({ handlePrint }: IncrementCalcProps) {
  const [incrementAmount, setIncrementAmount] = useState('');
  const [totalMonths, setTotalMonths] = useState('--Select--');
  const [enterDays, setEnterDays] = useState('26');
  const [eidBonusSelect, setEidBonusSelect] = useState('');
  const [incrementResult, setIncrementResult] = useState<IncrementResult | null>(null);

  const handleClear = () => {
    setIncrementAmount('');
    setTotalMonths('--Select--');
    setEnterDays('26');
    setEidBonusSelect('');
    setIncrementResult(null);
  };

  const calculateIncrement = (amount: number, monthsCount: number, days: number, bonusType: number) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].slice(0, monthsCount);
    const data: IncrementData[] = [];

    for (let i = 0; i < monthsCount; i++) {
      const iAmount = amount;
      const weekend = 0; 
      const gHoliday = 0; 
      
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
  };

  return (
    <div className="p-3">
      <form onSubmit={handleCalculate} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Increment Amount:</label>
          <input type="number" value={incrementAmount} onChange={(e) => setIncrementAmount(e.target.value)} placeholder="Enter Amount" className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Total Months:</label>
          <select value={totalMonths} onChange={(e) => setTotalMonths(e.target.value)} className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option value="--Select--">--Select--</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Enter Days:</label>
          <select value={enterDays} onChange={(e) => setEnterDays(e.target.value)} className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option value="26">26</option>
            <option value="30">30</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Eid Bonus:</label>
          <select value={eidBonusSelect} onChange={(e) => setEidBonusSelect(e.target.value)} className="w-full h-11 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option value="">--Select--</option>
            <option value="1">1</option>
            <option value="2">2</option>
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

      {incrementResult && (
        <div className="mt-10 space-y-10">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Amount Summary</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
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
            <div className="overflow-x-auto rounded-lg border border-slate-200">
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
  );
}
