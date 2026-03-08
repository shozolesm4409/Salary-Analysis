import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, setDoc, deleteDoc, doc, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore';
import { Edit2, Trash2, Plus, X, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSettings } from '@/hooks/useSettings';
import html2pdf from 'html2pdf.js';

interface PopulationData {
  id: string;
  name: string;
  members: number;
}

export default function HaziparaPopulation() {
  const [data, setData] = useState<PopulationData[]>([]);
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'population' | 'download' | 'upload'>('population');
  const [previewData, setPreviewData] = useState<{ name: string; members: number }[]>([]);

  const [itemToDelete, setItemToDelete] = useState<PopulationData | null>(null);
  const { isButtonHidden } = useSettings();
  const downloadRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'hazipara_population'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PopulationData)));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    const mem = parseInt(members);
    if (name && !isNaN(mem)) {
      if (editingId) {
        await setDoc(doc(db, 'hazipara_population', editingId), { name, members: mem }, { merge: true });
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'hazipara_population'), { name, members: mem });
      }
      setName('');
      setMembers('');
      setIsModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteDoc(doc(db, 'hazipara_population', itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const deleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all records?")) {
      const batch = writeBatch(db);
      data.forEach(item => {
        batch.delete(doc(db, 'hazipara_population', item.id));
      });
      await batch.commit();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const parsedData: { name: string; members: number }[] = [];
      
      // Assuming first row is header, skip it
      for (let i = 1; i < json.length; i++) {
        const [name, members] = json[i];
        const mem = parseInt(String(members).trim());
        if (name && !isNaN(mem)) {
          parsedData.push({ name: String(name).trim(), members: mem });
        }
      }
      
      setPreviewData(parsedData);
    };
    reader.readAsBinaryString(file);
  };

  const confirmUpload = async () => {
    const batch = writeBatch(db);
    for (const item of previewData) {
      const docRef = doc(collection(db, 'hazipara_population'));
      batch.set(docRef, item);
    }
    await batch.commit();
    setPreviewData([]);
    alert('Data uploaded successfully!');
  };

  const openModal = (item?: PopulationData) => {
    if (item) {
      setEditingId(item.id);
      setName(item.name);
      setMembers(item.members.toString());
    } else {
      setEditingId(null);
      setName('');
      setMembers('');
    }
    setIsModalOpen(true);
  };

  const generatePDF = async () => {
    const element = downloadRef.current;
    if (!element) return;
    
    const opt: any = {
      margin: 0.5,
      filename: 'Hazipara_Population.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  // Split data for download view
  const colSize = Math.ceil(data.length / 3);
  const col1 = data.slice(0, colSize);
  const col2 = data.slice(colSize, colSize * 2);
  const col3 = data.slice(colSize * 2);

  return (
    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex gap-3 mb-3 border-b border-slate-200 overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('population')} 
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'population' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Population
        </button>
        <button 
          onClick={() => setActiveTab('download')} 
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'download' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Download
        </button>
        <button 
          onClick={() => setActiveTab('upload')} 
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Upload
        </button>
      </div>

      <div className="p-4 border border-slate-200 rounded-xl">
        {activeTab === 'population' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-slate-800">Hazipara Population</h2>
              <button onClick={() => openModal()} className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Record
              </button>
            </div>

            <div className="max-h-[600px] overflow-y-auto border border-slate-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 sticky top-0">
                    <th className="border border-slate-200 p-2 text-center">নং</th>
                    <th className="border border-slate-200 p-2 text-left">Name</th>
                    <th className="border border-slate-200 p-2 text-left">Members</th>
                    <th className="border border-slate-200 p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="border border-slate-200 p-2 text-center">{index + 1}</td>
                      <td className="border border-slate-200 p-2">{item.name}</td>
                      <td className="border border-slate-200 p-2">{isNaN(item.members) ? 0 : item.members}</td>
                      <td className="border border-slate-200 p-2 flex gap-2 justify-center">
                        <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setItemToDelete(item)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isButtonHidden('delete_all_hazipara') && (
              <div className="mt-4">
                <button onClick={deleteAll} className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700">Delete All</button>
              </div>
            )}
          </>
        )}

        {activeTab === 'download' && (
          <div className="py-6" ref={downloadRef}>
            <h1 className="text-2xl font-bold text-center mb-8 text-slate-800">মধ্যদুর্গাপুর হাজীপাডা সমাজ নিয়ন্ত্রিত পরিবার ও লোক-সংখ্যার বিবরণ</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                        <td className="border border-slate-300 p-2 text-center text-sm">{isNaN(item.members) ? 0 : item.members}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>

            <div className="flex justify-center">
              <button 
                onClick={generatePDF}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2 shadow-lg"
              >
                <Download className="w-5 h-5" /> ডাউনলোড PDF
              </button>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="py-10">
            {previewData.length === 0 ? (
              <div className="text-center border-2 border-dashed border-slate-300 rounded-xl p-10">
                <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} className="hidden" id="csvUpload" />
                <label htmlFor="csvUpload" className="cursor-pointer bg-slate-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-900 flex items-center gap-2 mx-auto w-max">
                  <Upload className="w-5 h-5" /> Upload CSV/Excel File
                </label>
                <p className="mt-2 text-slate-500">Format: Name, Members</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold mb-4">Preview Upload</h3>
                <div className="max-h-96 overflow-y-auto mb-4 border border-slate-200">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 sticky top-0">
                        <th className="border border-slate-200 p-2 text-center">নং</th>
                        <th className="border border-slate-200 p-2 text-left">Name</th>
                        <th className="border border-slate-200 p-2 text-left">Members</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="border border-slate-200 p-2 text-center">{index + 1}</td>
                          <td className="border border-slate-200 p-2">{item.name}</td>
                          <td className="border border-slate-200 p-2">{item.members}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setPreviewData([])} className="flex-1 bg-slate-200 text-slate-800 px-4 py-2 rounded font-medium hover:bg-slate-300">Cancel</button>
                  <button onClick={confirmUpload} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700">Confirm Upload</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50">
          <div className="bg-white p-3 rounded-xl w-full max-w-md shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editingId ? 'Edit Record' : 'Add Record'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="border p-2 rounded w-full mb-4" />
            <input type="number" value={members} onChange={e => setMembers(e.target.value)} placeholder="Members" className="border p-2 rounded w-full mb-4" />
            <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 w-full">{editingId ? 'Update' : 'Add'}</button>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50">
          <div className="bg-white p-3 rounded-xl w-full max-w-sm shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold mb-4">Are you sure?</h3>
            <p className="text-slate-600 mb-6">Do you really want to delete the record for <strong>{itemToDelete.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setItemToDelete(null)} className="flex-1 bg-slate-200 text-slate-800 px-4 py-2 rounded font-medium hover:bg-slate-300">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
