import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Copy, Check } from 'lucide-react';

interface Formula {
  id?: string;
  name: string;
  expression: string;
}

export default function Formula() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFormulas();
  }, []);

  const fetchFormulas = async () => {
    const querySnapshot = await getDocs(collection(db, 'formulas'));
    const formulasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Formula));
    setFormulas(formulasData);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container mx-auto px-2 py-3">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Available Formulas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formulas.map(f => (
          <div key={f.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
            <h3 className="text-xl font-bold text-blue-700 mb-2">{f.name}</h3>
            <p className="text-slate-600 font-mono bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2 flex-grow">{f.expression}</p>
            <button 
              onClick={() => f.id && copyToClipboard(f.expression, f.id)}
              className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              {copiedId === f.id ? <Check size={16} /> : <Copy size={16} />}
              {copiedId === f.id ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
