import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Trash2, Plus, Save, Edit2, EyeOff, X, Copy } from 'lucide-react';

interface Formula {
  id?: string;
  name: string;
  expression: string;
  hidden?: boolean;
}

export default function FormulaManage() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [name, setName] = useState('');
  const [expression, setExpression] = useState('');
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

  const handleSave = async () => {
    if (!name || !expression) return;
    if (editingFormula) {
      await updateDoc(doc(db, 'formulas', editingFormula.id!), { name, expression });
    } else {
      await addDoc(collection(db, 'formulas'), { name, expression, hidden: false });
    }
    setName('');
    setExpression('');
    setEditingFormula(null);
    setIsPopupOpen(false);
    fetchFormulas();
  };

  const handleEdit = (formula: Formula) => {
    setEditingFormula(formula);
    setName(formula.name);
    setExpression(formula.expression);
    setIsPopupOpen(true);
  };

  const handleToggleHide = async (formula: Formula) => {
    await updateDoc(doc(db, 'formulas', formula.id!), { hidden: !formula.hidden });
    fetchFormulas();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this formula?')) {
      await deleteDoc(doc(db, 'formulas', id));
      fetchFormulas();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Formula Manage</h1>
        <button 
          onClick={() => { setIsPopupOpen(true); setEditingFormula(null); setName(''); setExpression(''); }}
          className="flex items-center gap-2 px-2 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Formula
        </button>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-3 rounded-2xl shadow-xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-700">{editingFormula ? 'Edit Formula' : 'Add New Formula'}</h2>
              <button onClick={() => setIsPopupOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Formula Name" className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" value={expression} onChange={(e) => setExpression(e.target.value)} placeholder="Expression" className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4" />
              {editingFormula ? 'Update Formula' : 'Save Formula'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Saved Formulas</h2>
        
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="pb-1 w-[30%]">Name</th>
                <th className="pb-1 w-[55%]">Expression</th>
                <th className="pb-1 w-[15%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formulas.map(f => (
                <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 font-bold text-slate-800 w-[30%]">{f.name}</td>
                  <td className="py-2 text-slate-500 font-mono text-sm w-[55%]">{f.expression}</td>
                  <td className="py-2 text-right space-x-2 w-[15%]">
                    <button onClick={() => f.id && copyToClipboard(f.expression, f.id)} className="text-slate-500 hover:text-slate-700 relative">
                      <Copy className="w-5 h-5" />
                      {copiedId === f.id && <span className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded">Copied!</span>}
                    </button>
                    <button onClick={() => handleEdit(f)} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => handleToggleHide(f)} className={`hover:text-slate-700 ${f.hidden ? 'text-slate-700' : 'text-slate-400'}`}><EyeOff className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(f.id!)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {formulas.map(f => (
            <div key={f.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-start">
                <p className="font-bold text-slate-800">{f.name}</p>
                <div className="flex gap-2">
                  <button onClick={() => f.id && copyToClipboard(f.expression, f.id)} className="text-slate-500 relative">
                    <Copy className="w-5 h-5" />
                    {copiedId === f.id && <span className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded">Copied!</span>}
                  </button>
                  <button onClick={() => handleEdit(f)} className="text-blue-500"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleToggleHide(f)} className={f.hidden ? 'text-slate-700' : 'text-slate-400'}><EyeOff className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(f.id!)} className="text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
              <p className="text-slate-500 font-mono text-sm bg-white p-1 rounded-lg border border-slate-100">{f.expression}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
