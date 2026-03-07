import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Download } from 'lucide-react';

interface PopulationData {
  id: string;
  name: string;
  members: number;
}

export default function HaziparaPopulationDownload() {
  const [data, setData] = useState<PopulationData[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'hazipara_population'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PopulationData)));
    });
    return () => unsubscribe();
  }, []);

  // Split data into 3 columns
  const colSize = Math.ceil(data.length / 3);
  const col1 = data.slice(0, colSize);
  const col2 = data.slice(colSize, colSize * 2);
  const col3 = data.slice(colSize * 2);

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-slate-800">মধ্যদুর্গাপুর হাজীপাডা সমাজ নিয়ন্ত্রিত পরিবার ও লোক-সংখ্যার বিবরণ</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[col1, col2, col3].map((col, colIndex) => (
          <table key={colIndex} className="w-full border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2 text-sm">ক্র. নং</th>
                <th className="border border-slate-300 p-2 text-sm text-left">নাম</th>
                <th className="border border-slate-300 p-2 text-sm">লোক সংখ্যা</th>
              </tr>
            </thead>
            <tbody>
              {col.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-slate-300 p-2 text-center text-sm">{colIndex * colSize + index + 1}</td>
                  <td className="border border-slate-300 p-2 text-sm">{item.name}</td>
                  <td className="border border-slate-300 p-2 text-center text-sm">{item.members}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>

      <div className="flex justify-center">
        <a 
          href="/hazipara_population.pdf" 
          download="Hazipara_Population.pdf"
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2 shadow-lg"
        >
          <Download className="w-5 h-5" /> ডাউনলোড PDF
        </a>
      </div>
    </div>
  );
}
