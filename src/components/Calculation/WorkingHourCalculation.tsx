import React, { useState } from 'react';

export default function WorkingHourCalculation() {
  const [workingHours, setWorkingHours] = useState<Record<string, { hour: string; day: string }>>({
    january: { hour: '', day: '26' },
    february: { hour: '', day: '26' },
    march: { hour: '', day: '26' },
    april: { hour: '', day: '26' },
    may: { hour: '', day: '26' },
    june: { hour: '', day: '26' },
    july: { hour: '', day: '26' },
    august: { hour: '', day: '26' },
    september: { hour: '', day: '26' },
    october: { hour: '', day: '26' },
    november: { hour: '', day: '26' },
    december: { hour: '', day: '26' }
  });

  const calculateWorkingHourAverage = (month: string) => {
    const data = workingHours[month];
    if (!data.hour || !data.day) return '0:00';
    
    const [h, m] = data.hour.split(':').map(n => parseInt(n) || 0);
    const totalMinutes = (h * 60) + m;
    const days = parseInt(data.day) || 1;
    
    const avgMinutes = totalMinutes / days;
    const avgH = Math.floor(avgMinutes / 60);
    const avgM = Math.round(avgMinutes % 60);
    
    return `${avgH}:${avgM.toString().padStart(2, '0')}`;
  };

  const getWorkingHourTotals = () => {
    let totalMinutes = 0;
    let totalDays = 0;
    
    Object.values(workingHours).forEach((data: { hour: string; day: string }) => {
      if (data.hour) {
        const [h, m] = data.hour.split(':').map(n => parseInt(n) || 0);
        totalMinutes += (h * 60) + m;
      }
      totalDays += parseInt(data.day) || 0;
    });
    
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    
    const avgTotalMinutes = totalDays > 0 ? totalMinutes / totalDays : 0;
    const avgH = Math.floor(avgTotalMinutes / 60);
    const avgM = Math.round(avgTotalMinutes % 60);
    
    return {
      hours: `${h}:${m.toString().padStart(2, '0')}`,
      days: totalDays.toString(),
      avg: `${avgH}:${avgM.toString().padStart(2, '0')}`
    };
  };

  const handleClear = () => {
    const cleared = { ...workingHours };
    Object.keys(cleared).forEach(k => {
      cleared[k] = { hour: '', day: '26' };
    });
    setWorkingHours(cleared);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
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
  );
}
