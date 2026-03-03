import React, { useState, useMemo, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { format, parseISO, startOfMonth, endOfMonth, isSameMonth, addMonths } from 'date-fns';
import { 
  Search, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Loader2,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

// Helper to generate month options
const getMonthOptions = () => {
  const options = [];
  const today = new Date();
  for (let i = -12; i <= 24; i++) {
    const date = addMonths(today, i);
    options.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMM-yy')
    });
  }
  return options;
};

interface LoanScheduleRow {
  id: string;
  month: string; // YYYY-MM
  input1: string;
  input2: string;
}

interface CustomSettings {
  loanAmount: number;
  loanLent: number;
}

export default function LoanFlow() {
  const { user } = useAuth();
  const { transactions, loading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<{ category: string; department: string } | null>(null);
  
  // Schedule State
  const [scheduleRows, setScheduleRows] = useState<LoanScheduleRow[]>([]);
  const [allSchedules, setAllSchedules] = useState<Record<string, LoanScheduleRow[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Custom Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customSettings, setCustomSettings] = useState<Record<string, CustomSettings>>({});
  const [currentSettings, setCurrentSettings] = useState<CustomSettings>({ loanAmount: 0, loanLent: 0 });

  // Fetch all schedules and settings on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'loan_schedules'));
        const schedules: Record<string, LoanScheduleRow[]> = {};
        const settings: Record<string, CustomSettings> = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.department) {
            if (data.rows) schedules[data.department] = data.rows;
            if (data.customSettings) settings[data.department] = data.customSettings;
          }
        });
        setAllSchedules(schedules);
        setCustomSettings(settings);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Group transactions by category to form the main table
  const loanData = useMemo(() => {
    const grouped: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(t => {
      // Filter for Bank Loan only
      if (t.category !== 'Bank Loan') return;

      // Group by Department
      const key = t.department;

      if (!grouped[key]) {
        grouped[key] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        grouped[key].income += t.amount;
      } else {
        grouped[key].expense += t.amount;
      }
    });

    return Object.entries(grouped).map(([department, data], index) => {
      const isBkashL = department.toLowerCase() === 'bkashl';
      const settings = customSettings[department];
      
      const loanAmount = isBkashL && settings?.loanAmount ? settings.loanAmount : data.income;
      const paidAmount = data.expense;
      const dueAmount = loanAmount - paidAmount;
      
      // Get schedule for this department
      const schedule = allSchedules[department] || [];
      
      // Loan Lent: Sum of Input 1 or Custom Setting
      const loanLent = isBkashL && settings?.loanLent ? settings.loanLent : schedule.reduce((sum, row) => {
        const val = parseFloat(row.input1);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      // P.loan Amount: (Loan Amount / 1000) * 25
      const pLoanAmount = (loanAmount / 1000) * 25;

      // T.Paid Amount: Loan Lent * P.loan Amount
      const totalPaidAmount = loanLent * pLoanAmount;

      return {
        id: index + 1,
        category: 'Bank Loan',
        department, // Add department
        loanAmount,
        paidAmount,
        dueAmount,
        loanLent,
        pLoanAmount,
        totalPaidAmount,
        isBkashL
      };
    }).filter(item => 
      item.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm, allSchedules, customSettings]);

  // Helper to generate safe document ID
  const getScheduleDocId = (department: string) => {
    // Replace slashes with underscores to prevent path nesting issues
    // Also trim whitespace just in case
    const safeDept = department.trim().replace(/[\/]/g, '_'); 
    return `bank_loan_${safeDept}`;
  };

  // Handle View Details
  const handleViewDetails = async (department: string) => {
    setSelectedLoan({ category: 'Bank Loan', department });
    setIsLoadingSchedule(true);
    
    // Load current settings if it's BkashL
    if (department.toLowerCase() === 'bkashl') {
      setCurrentSettings(customSettings[department] || { loanAmount: 0, loanLent: 0 });
    }
    
    try {
      // Try to fetch existing schedule
      const docId = getScheduleDocId(department);
      const docRef = doc(db, 'loan_schedules', docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const rows = docSnap.data().rows || [];
        // Ensure unique IDs
        const uniqueRows = rows.map((row: any, index: number) => ({
          ...row,
          id: row.id || `${Date.now()}-${index}` // Fallback if ID is missing
        }));
        
        // Check for duplicates
        const seenIds = new Set();
        const sanitizedRows = uniqueRows.map((row: any) => {
          if (seenIds.has(row.id)) {
            return { ...row, id: `${row.id}-${Math.random().toString(36).substr(2, 5)}` };
          }
          seenIds.add(row.id);
          return row;
        });
        
        setScheduleRows(sanitizedRows);
      } else {
        // Initialize with default row if no saved data
        setScheduleRows([
          { id: '1', month: format(new Date(), 'yyyy-MM'), input1: '', input2: '' }
        ]);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      // Fallback to default
      setScheduleRows([
        { id: '1', month: format(new Date(), 'yyyy-MM'), input1: '', input2: '' }
      ]);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedLoan || !user) return;
    
    setIsSaving(true);
    try {
      const docId = getScheduleDocId(selectedLoan.department);
      const docRef = doc(db, 'loan_schedules', docId);
      
      // We need to get the existing doc to preserve rows if they exist
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.exists() ? docSnap.data() : {};
      
      await setDoc(docRef, {
        ...existingData,
        department: selectedLoan.department,
        customSettings: currentSettings,
        updatedAt: Date.now(),
        updatedBy: user.uid
      }, { merge: true });
      
      // Update local state
      setCustomSettings(prev => ({
        ...prev,
        [selectedLoan.department]: currentSettings
      }));
      
      setIsSettingsOpen(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedLoan || !user) return;
    
    setIsSaving(true);
    try {
      const docId = getScheduleDocId(selectedLoan.department);
      const docRef = doc(db, 'loan_schedules', docId);
      await setDoc(docRef, {
        department: selectedLoan.department,
        rows: scheduleRows,
        updatedAt: Date.now(),
        updatedBy: user.uid
      });
      
      // Update local state
      setAllSchedules(prev => ({
        ...prev,
        [selectedLoan.department]: scheduleRows
      }));

      // Optional: Show success toast
      // alert("Schedule saved successfully!"); 
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRow = () => {
    const lastRow = scheduleRows[scheduleRows.length - 1];
    let nextMonth = new Date();
    if (lastRow) {
      nextMonth = addMonths(parseISO(lastRow.month + '-01'), 1);
    }
    
    setScheduleRows([
      ...scheduleRows,
      { 
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
        month: format(nextMonth, 'yyyy-MM'), 
        input1: '', 
        input2: '' 
      }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setScheduleRows(scheduleRows.filter(r => r.id !== id));
  };

  const handleRowChange = (id: string, field: keyof LoanScheduleRow, value: string) => {
    setScheduleRows(scheduleRows.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  // Check match for a row
  const checkMatch = (row: LoanScheduleRow, department: string) => {
    if (!row.month || !row.input2) return 'No Match';
    
    const amount = parseFloat(row.input2);
    if (isNaN(amount)) return 'No Match';

    const rowDate = parseISO(row.month + '-01');
    
    // Find any transaction in that month with matching category 'Bank Loan', department, and amount
    const match = transactions.find(t => 
      t.category === 'Bank Loan' &&
      t.department === department &&
      t.amount === amount &&
      isSameMonth(parseISO(t.date), rowDate)
    );

    return match ? 'Done' : 'No Match';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Loan Flow</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">SL</th>
                <th className="px-4 py-3">LoanType</th>
                <th className="px-4 py-3 text-right">Loan Amount</th>
                <th className="px-4 py-3 text-right">Paid Amount</th>
                <th className="px-4 py-3 text-right">Due Amount</th>
                <th className="px-4 py-3 text-right">Loan Lent</th>
                <th className="px-4 py-3 text-right">P.loan Amount</th>
                <th className="px-4 py-3 text-right">T.Paid Amount</th>
                <th className="px-4 py-3 text-center">View Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loanData.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">Bank Loan - {row.department}</td>
                  <td className="px-4 py-3 text-right text-blue-600 font-medium">{row.loanAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">{row.paidAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-orange-600 font-medium">{row.dueAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-purple-600 font-medium">{row.loanLent.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">{row.pLoanAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{row.totalPaidAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleViewDetails(row.department)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {loanData.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No loan data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Loan Details: <span className="text-blue-600">Bank Loan - {selectedLoan.department}</span>
                {selectedLoan.department.toLowerCase() === 'bkashl' && (
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-2"
                    title="Custom Settings"
                  >
                    <SettingsIcon className="w-5 h-5" />
                  </button>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveSchedule}
                  disabled={isSaving || isLoadingSchedule}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setSelectedLoan(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingSchedule ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-end">
                    <button
                      onClick={handleAddRow}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Month
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                          <th className="px-4 py-3 text-left w-16">SL</th>
                          <th className="px-4 py-3 text-left w-40">Month</th>
                          <th className="px-4 py-3 text-center w-32">Input 1</th>
                          <th className="px-4 py-3 text-center w-40">Input 2 (Amount)</th>
                          <th className="px-4 py-3 text-center w-32">Status</th>
                          <th className="px-4 py-3 text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {scheduleRows.map((row, index) => {
                          const status = checkMatch(row, selectedLoan.department);
                          return (
                            <tr key={row.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2 text-slate-500">{index + 1}</td>
                              <td className="px-4 py-2">
                                <select
                                  value={row.month}
                                  onChange={(e) => handleRowChange(row.id, 'month', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {getMonthOptions().map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={row.input1}
                                  onChange={(e) => handleRowChange(row.id, 'input1', e.target.value)}
                                  className="w-full px-2 py-1 bg-blue-50 border border-blue-100 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-medium"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={row.input2}
                                  onChange={(e) => handleRowChange(row.id, 'input2', e.target.value)}
                                  className="w-full px-2 py-1 bg-blue-50 border border-blue-100 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-bold"
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                {status === 'Done' ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    Done
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    No Match
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => handleRemoveRow(row.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Custom Settings Modal */}
      {isSettingsOpen && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-blue-600" />
                Custom Settings
              </h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Custom Loan Amount
                </label>
                <input
                  type="number"
                  value={currentSettings.loanAmount || ''}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, loanAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom loan amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Custom Loan Lent
                </label>
                <input
                  type="number"
                  value={currentSettings.loanLent || ''}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, loanLent: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom loan lent"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
