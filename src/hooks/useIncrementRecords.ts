import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export interface IncrementRecord {
  id: string;
  sl?: number; // Serial number for display
  year: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'Completed' | 'Active' | 'Inactive' | 'Pending';
  remark: string;
  timestamp?: any;
  deletedAt?: number;
  originalId?: string;
}

export function useIncrementRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<IncrementRecord[]>([]);
  const [deletedRecords, setDeletedRecords] = useState<IncrementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setDeletedRecords([]);
      setLoading(false);
      return;
    }

    // Active records
    const q = query(collection(db, 'increment_records'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        sl: snapshot.docs.length - index
      })) as IncrementRecord[];
      
      setRecords(data);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching increment records:", err);
      setError(err.message);
      setLoading(false);
    });

    // Deleted records
    const qDeleted = query(collection(db, 'deleted_increment_records'), orderBy('deletedAt', 'desc'));
    const unsubDeleted = onSnapshot(qDeleted, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IncrementRecord[];
      setDeletedRecords(data);
    }, (err) => {
      console.error("Error fetching deleted increment records:", err);
    });

    return () => {
      unsubscribe();
      unsubDeleted();
    };
  }, [user]);

  const addRecord = async (record: Omit<IncrementRecord, 'id' | 'sl' | 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'increment_records'), {
        ...record,
        timestamp: serverTimestamp()
      });
      return { success: true, message: 'Record added successfully' };
    } catch (err: any) {
      console.error("Error adding record:", err);
      throw new Error(err.message);
    }
  };

  const updateRecord = async (id: string, record: Partial<IncrementRecord>) => {
    try {
      const { id: _, sl: __, timestamp: ___, ...dataToUpdate } = record as any;
      await updateDoc(doc(db, 'increment_records', id), dataToUpdate);
      return { success: true, message: 'Record updated successfully' };
    } catch (err: any) {
      console.error("Error updating record:", err);
      throw new Error(err.message);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const docRef = doc(db, 'increment_records', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Move to deleted_increment_records collection
        await addDoc(collection(db, 'deleted_increment_records'), {
          ...data,
          deletedAt: Date.now(),
          originalId: id
        });
        // Delete from active records
        await deleteDoc(docRef);
      }
      return { success: true, message: 'Record deleted successfully' };
    } catch (err: any) {
      console.error("Error deleting record:", err);
      throw new Error(err.message);
    }
  };

  const restoreRecord = async (id: string) => {
    try {
      const docRef = doc(db, 'deleted_increment_records', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const { deletedAt, originalId, ...data } = docSnap.data() as any;
        // Restore to increment_records
        await addDoc(collection(db, 'increment_records'), data);
        // Delete from deleted_increment_records
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error("Error restoring increment record:", error);
      throw error;
    }
  };

  const permanentlyDeleteRecord = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'deleted_increment_records', id));
    } catch (error) {
      console.error("Error permanently deleting increment record:", error);
      throw error;
    }
  };

  const permanentlyDeleteAllRecords = async () => {
    try {
      const promises = deletedRecords.map(r => 
        r.id ? deleteDoc(doc(db, 'deleted_increment_records', r.id)) : Promise.resolve()
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error permanently deleting all increment records:", error);
      throw error;
    }
  };

  return {
    records,
    deletedRecords,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    restoreRecord,
    permanentlyDeleteRecord,
    permanentlyDeleteAllRecords
  };
}
