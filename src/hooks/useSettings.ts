import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category, Department } from '@/types';
import { useAuth } from '@/context/AuthContext';

export interface TableSetting {
  id: string;
  name: string;
  label: string;
  isHidden: boolean;
}

export interface ButtonSetting {
  id: string;
  name: string;
  label: string;
  isHidden: boolean;
}

export interface ActionSetting {
  id: string;
  name: string;
  label: string;
  isHidden: boolean;
}

export function useSettings() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tableSettings, setTableSettings] = useState<TableSetting[]>([]);
  const [buttonSettings, setButtonSettings] = useState<ButtonSetting[]>([]);
  const [actionSettings, setActionSettings] = useState<ActionSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCategories([]);
      setDepartments([]);
      setTableSettings([]);
      setButtonSettings([]);
      setActionSettings([]);
      setLoading(false);
      setError(null);
      return;
    }

    const catQuery = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const deptQuery = query(collection(db, 'departments'), orderBy('name', 'asc'));
    const tableSettingsQuery = query(collection(db, 'table_settings'));
    const buttonSettingsQuery = query(collection(db, 'button_settings'));
    const actionSettingsQuery = query(collection(db, 'action_settings'));

    const unsubCats = onSnapshot(catQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
      setCategories(data);
      setError(null);
    }, (err) => {
      console.error("Firestore categories error:", err);
      if (err.message.includes('permission')) {
        setError("Missing or insufficient permissions. Please check your Firestore security rules.");
      } else {
        setError(err.message);
      }
    });

    const unsubDepts = onSnapshot(deptQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Department[];
      setDepartments(data);
      setError(null);
    }, (err) => {
      console.error("Firestore departments error:", err);
      if (err.message.includes('permission')) {
        setError("Missing or insufficient permissions. Please check your Firestore security rules.");
      } else {
        setError(err.message);
      }
    });

    const unsubTableSettings = onSnapshot(tableSettingsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TableSetting[];
      
      const defaultSettings: TableSetting[] = [
        { id: 'transactions', name: 'transactions', label: 'Transactions Table', isHidden: false },
        { id: 'deleted_transactions', name: 'deleted_transactions', label: 'Deleted Transactions Table', isHidden: false },
        { id: 'iesd_summary', name: 'iesd_summary', label: 'IESD Summary Table', isHidden: false },
        { id: 'iesd_profit', name: 'iesd_profit', label: 'IESD Profit Table', isHidden: false },
        { id: 'iesd_dps', name: 'iesd_dps', label: 'IESD DPS History Table', isHidden: false },
        { id: 'reports_monthly', name: 'reports_monthly', label: 'Reports Monthly Summary', isHidden: false },
        { id: 'reports_category', name: 'reports_category', label: 'Reports Category Summary', isHidden: false },
        { id: 'dsm_monthly_summary', name: 'dsm_monthly_summary', label: 'DSM Monthly Summary', isHidden: false },
        { id: 'dsm_salary_summary', name: 'dsm_salary_summary', label: 'DSM Salary Summary', isHidden: false },
        { id: 'dsm_personal_loan', name: 'dsm_personal_loan', label: 'DSM Personal Loan Table', isHidden: false },
        { id: 'dsm_home_bank_loan', name: 'dsm_home_bank_loan', label: 'DSM Home & Bank Loan Table', isHidden: false },
        { id: 'dsm_bank_loan', name: 'dsm_bank_loan', label: 'DSM Bank Loan Table', isHidden: false },
        { id: 'dsm_financial_dashboard', name: 'dsm_financial_dashboard', label: 'DSM Financial Dashboard (DBP)', isHidden: false },
        { id: 'increment_record', name: 'increment_record', label: 'Increment Record Table', isHidden: false },
        { id: 'increment_deleted', name: 'increment_deleted', label: 'Increment Deleted Table', isHidden: false },
        { id: 'taken_given', name: 'taken_given', label: 'Taken & Given Table', isHidden: false },
        { id: 'lend_give_back', name: 'lend_give_back', label: 'Lend & Give Back Table', isHidden: false },
      ];

      // Ensure all default settings exist in Firestore
      const existingIds = new Set(data.map(s => s.id));
      let hasMissing = false;

      defaultSettings.forEach(setting => {
        if (!existingIds.has(setting.id)) {
          hasMissing = true;
          setDoc(doc(db, 'table_settings', setting.id), setting).catch(err => {
            console.warn(`Could not initialize table setting ${setting.id} in Firestore:`, err.message);
          });
        }
      });

      if (!hasMissing) {
        setTableSettings(data);
      }
    }, (error) => {
      console.warn("Firestore table_settings error (using defaults):", error.message);
      
      // Fallback to default settings if we can't read from Firestore
      const defaultSettings: TableSetting[] = [
        { id: 'transactions', name: 'transactions', label: 'Transactions Table', isHidden: false },
        { id: 'deleted_transactions', name: 'deleted_transactions', label: 'Deleted Transactions Table', isHidden: false },
        { id: 'iesd_summary', name: 'iesd_summary', label: 'IESD Summary Table', isHidden: false },
        { id: 'iesd_profit', name: 'iesd_profit', label: 'IESD Profit Table', isHidden: false },
        { id: 'iesd_dps', name: 'iesd_dps', label: 'IESD DPS History Table', isHidden: false },
        { id: 'reports_monthly', name: 'reports_monthly', label: 'Reports Monthly Summary', isHidden: false },
        { id: 'reports_category', name: 'reports_category', label: 'Reports Category Summary', isHidden: false },
        { id: 'dsm_monthly_summary', name: 'dsm_monthly_summary', label: 'DSM Monthly Summary', isHidden: false },
        { id: 'dsm_salary_summary', name: 'dsm_salary_summary', label: 'DSM Salary Summary', isHidden: false },
        { id: 'dsm_personal_loan', name: 'dsm_personal_loan', label: 'DSM Personal Loan Table', isHidden: false },
        { id: 'dsm_home_bank_loan', name: 'dsm_home_bank_loan', label: 'DSM Home & Bank Loan Table', isHidden: false },
        { id: 'dsm_bank_loan', name: 'dsm_bank_loan', label: 'DSM Bank Loan Table', isHidden: false },
        { id: 'dsm_financial_dashboard', name: 'dsm_financial_dashboard', label: 'DSM Financial Dashboard (DBP)', isHidden: false },
        { id: 'increment_record', name: 'increment_record', label: 'Increment Record Table', isHidden: false },
        { id: 'increment_deleted', name: 'increment_deleted', label: 'Increment Deleted Table', isHidden: false },
        { id: 'taken_given', name: 'taken_given', label: 'Taken & Given Table', isHidden: false },
        { id: 'lend_give_back', name: 'lend_give_back', label: 'Lend & Give Back Table', isHidden: false },
      ];
      setTableSettings(defaultSettings);
    });

    const unsubButtonSettings = onSnapshot(buttonSettingsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ButtonSetting[];
      
      const defaultSettings: ButtonSetting[] = [
        { id: 'delete_all_transactions', name: 'delete_all_transactions', label: 'Transactions Delete All Button', isHidden: false },
        { id: 'delete_all_deleted_transactions', name: 'delete_all_deleted_transactions', label: 'Deleted Transactions Delete All Button', isHidden: false },
        { id: 'dashboard_pdf', name: 'dashboard_pdf', label: 'Dashboard PDF Export Button', isHidden: false },
        { id: 'dashboard_excel', name: 'dashboard_excel', label: 'Dashboard Excel Export Button', isHidden: false },
      ];

      const existingIds = new Set(data.map(s => s.id));
      let hasMissing = false;

      defaultSettings.forEach(setting => {
        if (!existingIds.has(setting.id)) {
          hasMissing = true;
          setDoc(doc(db, 'button_settings', setting.id), setting).catch(err => {
            console.warn(`Could not initialize button setting ${setting.id} in Firestore:`, err.message);
          });
        }
      });

      if (!hasMissing) {
        setButtonSettings(data);
      }
    }, (error) => {
      console.warn("Firestore button_settings error (using defaults):", error.message);
      const defaultSettings: ButtonSetting[] = [
        { id: 'delete_all_transactions', name: 'delete_all_transactions', label: 'Transactions Delete All Button', isHidden: false },
        { id: 'delete_all_deleted_transactions', name: 'delete_all_deleted_transactions', label: 'Deleted Transactions Delete All Button', isHidden: false },
        { id: 'dashboard_pdf', name: 'dashboard_pdf', label: 'Dashboard PDF Export Button', isHidden: false },
        { id: 'dashboard_excel', name: 'dashboard_excel', label: 'Dashboard Excel Export Button', isHidden: false },
      ];
      setButtonSettings(defaultSettings);
    });

    const unsubActionSettings = onSnapshot(actionSettingsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActionSetting[];
      
      const defaultSettings: ActionSetting[] = [
        { id: 'transactions_action', name: 'transactions_action', label: 'Transactions Action Column', isHidden: false },
        { id: 'deleted_transactions_action', name: 'deleted_transactions_action', label: 'Deleted Transactions Action Column', isHidden: false },
        { id: 'categories_action', name: 'categories_action', label: 'Categories Action Column', isHidden: false },
        { id: 'departments_action', name: 'departments_action', label: 'Departments Action Column', isHidden: false },
        { id: 'increment_record_action', name: 'increment_record_action', label: 'Increment Record Action Column', isHidden: false },
        { id: 'increment_deleted_action', name: 'increment_deleted_action', label: 'Increment Deleted Action Column', isHidden: false },
      ];

      const existingIds = new Set(data.map(s => s.id));
      let hasMissing = false;

      defaultSettings.forEach(setting => {
        if (!existingIds.has(setting.id)) {
          hasMissing = true;
          setDoc(doc(db, 'action_settings', setting.id), setting).catch(err => {
            console.warn(`Could not initialize action setting ${setting.id} in Firestore:`, err.message);
          });
        }
      });

      if (!hasMissing) {
        setActionSettings(data);
        setLoading(false);
      }
    }, (error) => {
      console.warn("Firestore action_settings error (using defaults):", error.message);
      const defaultSettings: ActionSetting[] = [
        { id: 'transactions_action', name: 'transactions_action', label: 'Transactions Action Column', isHidden: false },
        { id: 'deleted_transactions_action', name: 'deleted_transactions_action', label: 'Deleted Transactions Action Column', isHidden: false },
        { id: 'categories_action', name: 'categories_action', label: 'Categories Action Column', isHidden: false },
        { id: 'departments_action', name: 'departments_action', label: 'Departments Action Column', isHidden: false },
        { id: 'increment_record_action', name: 'increment_record_action', label: 'Increment Record Action Column', isHidden: false },
        { id: 'increment_deleted_action', name: 'increment_deleted_action', label: 'Increment Deleted Action Column', isHidden: false },
      ];
      setActionSettings(defaultSettings);
      setLoading(false);
    });

    // Safety timeout: if Firestore doesn't resolve in 3 seconds, stop loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      unsubCats();
      unsubDepts();
      unsubTableSettings();
      unsubButtonSettings();
      unsubActionSettings();
      clearTimeout(timeout);
    };
  }, [user]);

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    await addDoc(collection(db, 'categories'), cat);
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    await updateDoc(doc(db, 'categories', id), data);
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
  };

  const addDepartment = async (dept: Omit<Department, 'id'>) => {
    await addDoc(collection(db, 'departments'), dept);
  };

  const updateDepartment = async (id: string, data: Partial<Department>) => {
    await updateDoc(doc(db, 'departments', id), data);
  };

  const deleteDepartment = async (id: string) => {
    await deleteDoc(doc(db, 'departments', id));
  };

  const updateTableSetting = async (id: string, isHidden: boolean) => {
    await updateDoc(doc(db, 'table_settings', id), { isHidden });
  };

  const updateButtonSetting = async (id: string, isHidden: boolean) => {
    await updateDoc(doc(db, 'button_settings', id), { isHidden });
  };

  const updateActionSetting = async (id: string, isHidden: boolean) => {
    await updateDoc(doc(db, 'action_settings', id), { isHidden });
  };

  const isTableHidden = (tableName: string) => {
    return tableSettings.find(s => s.name === tableName)?.isHidden || false;
  };

  const isButtonHidden = (buttonName: string) => {
    return buttonSettings.find(s => s.name === buttonName)?.isHidden || false;
  };

  const isActionHidden = (actionName: string) => {
    return actionSettings.find(s => s.name === actionName)?.isHidden || false;
  };

  return { 
    categories, 
    departments, 
    tableSettings,
    buttonSettings,
    actionSettings,
    loading, 
    error,
    addCategory, 
    updateCategory, 
    deleteCategory,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    updateTableSetting,
    updateButtonSetting,
    updateActionSetting,
    isTableHidden,
    isButtonHidden,
    isActionHidden
  };
}
