import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deletedTransactions, setDeletedTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setDeletedTransactions([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Active transactions
    const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    const unsubActive = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(data);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore error:", err);
      if (err.message.includes('permission')) {
        setError("Missing or insufficient permissions. Please check your Firestore security rules.");
      } else {
        setError(err.message);
      }
      setLoading(false);
    });

    // Deleted transactions
    const qDeleted = query(collection(db, 'deleted_transactions'), orderBy('deletedAt', 'desc'));
    const unsubDeleted = onSnapshot(qDeleted, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setDeletedTransactions(data);
    }, (error) => {
      console.error("Firestore deleted_transactions error:", error);
    });

    // Safety timeout: if Firestore doesn't resolve in 3 seconds, stop loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      unsubActive();
      unsubDeleted();
      clearTimeout(timeout);
    };
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    await addDoc(collection(db, 'transactions'), transaction);
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    await updateDoc(doc(db, 'transactions', id), data);
  };

  const deleteTransaction = async (id: string) => {
    try {
      const docRef = doc(db, 'transactions', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as Transaction;
        // Move to deleted_transactions collection
        await addDoc(collection(db, 'deleted_transactions'), {
          ...data,
          deletedAt: Date.now(),
          originalId: id
        });
        // Delete from active transactions
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  };

  const restoreTransaction = async (id: string) => {
    try {
      const docRef = doc(db, 'deleted_transactions', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const { deletedAt, originalId, ...data } = docSnap.data() as any;
        // Restore to transactions
        if (originalId) {
          await setDoc(doc(db, 'transactions', originalId), data);
        } else {
          await addDoc(collection(db, 'transactions'), data);
        }
        // Delete from deleted_transactions
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error("Error restoring transaction:", error);
      throw error;
    }
  };

  const permanentlyDeleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'deleted_transactions', id));
    } catch (error) {
      console.error("Error permanently deleting transaction:", error);
      throw error;
    }
  };

  const permanentlyDeleteAllTransactions = async () => {
    try {
      // Reduce batch size and increase delay to be more conservative
      const CHUNK_SIZE = 100; 
      for (let i = 0; i < deletedTransactions.length; i += CHUNK_SIZE) {
        const chunk = deletedTransactions.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(t => {
          if (t.id) {
            batch.delete(doc(db, 'deleted_transactions', t.id));
          }
        });
        await batch.commit();
        // Increase delay to 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Error permanently deleting all transactions:", error);
      throw error;
    }
  };

  const deleteAllTransactions = async () => {
    try {
      const promises = transactions.map(async (t) => {
        if (t.id) {
          // Move to deleted_transactions collection
          await addDoc(collection(db, 'deleted_transactions'), {
            ...t,
            deletedAt: Date.now(),
            originalId: t.id
          });
          // Delete from active transactions
          await deleteDoc(doc(db, 'transactions', t.id));
        }
      });
      await Promise.all(promises);
    } catch (error) {
      console.error("Error deleting all transactions:", error);
      throw error;
    }
  };

  return { 
    transactions, 
    deletedTransactions, 
    loading, 
    error,
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    restoreTransaction,
    permanentlyDeleteTransaction,
    permanentlyDeleteAllTransactions,
    deleteAllTransactions
  };
}
