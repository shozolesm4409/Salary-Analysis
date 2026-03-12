import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
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

    const q = query(collection(db, 'profit_records'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProfitRecord[];
      // Sort in-memory to avoid composite index requirement
      data.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setRecords(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addRecord = async (record: Omit<ProfitRecord, 'id' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, 'profit_records'), { ...record, userId: user.uid });
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
