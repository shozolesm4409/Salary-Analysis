import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProfitRecord } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function useProfitRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ProfitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'profit_records'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProfitRecord[];
      setRecords(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addRecord = async (record: Omit<ProfitRecord, 'id'>) => {
    await addDoc(collection(db, 'profit_records'), record);
  };

  const updateRecord = async (id: string, data: Partial<ProfitRecord>) => {
    await updateDoc(doc(db, 'profit_records', id), data);
  };

  const deleteRecord = async (id: string) => {
    await deleteDoc(doc(db, 'profit_records', id));
  };

  return { 
    records, 
    loading, 
    error,
    addRecord, 
    updateRecord, 
    deleteRecord 
  };
}
