import React, { useState } from 'react';
import { Printer, Trash2 } from 'lucide-react';

interface WorkingHourCalcProps {
  handlePrint: () => void;
}

export default function WorkingHourCalc({ handlePrint }: WorkingHourCalcProps) {
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

  const handleClear = () => {
    setWorkingHours(Object.keys(workingHours).reduce((acc, key) => ({ ...acc, [key]: { hour: '', day: '' } }), {}));
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
    <div className="p-3">
      <div className="mt-8 space-y-6">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
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
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-6">
          <button onClick={handleClear} className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 text-sm sm:text-base">
            <Trash2 className="w-5 h-5" />
            Clear
          </button>
          <button onClick={handlePrint} className="w-full sm:w-auto px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-100 flex items-center justify-center gap-2 text-sm sm:text-base">
            <Printer className="w-5 h-5" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
