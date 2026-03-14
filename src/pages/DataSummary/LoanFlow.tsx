import React, { useState, useMemo, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettings } from '@/hooks/useSettings';
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
  Settings as SettingsIcon,
  Award,
  Landmark,
  TrendingUp,
  TrendingDown,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

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
  pLoanAmount: number;
  loanLent: number;
}

export default function LoanFlow() {
  const { user } = useAuth();
  const { transactions, loading } = useTransactions();
  const { isActionHidden } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<{ category: string; department: string } | null>(null);
  const [certificateData, setCertificateData] = useState<any | null>(null);
  
  // Schedule State
  const [scheduleRows, setScheduleRows] = useState<LoanScheduleRow[]>([]);
  const [allSchedules, setAllSchedules] = useState<Record<string, LoanScheduleRow[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Custom Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customSettings, setCustomSettings] = useState<Record<string, CustomSettings>>({});
  const [currentSettings, setCurrentSettings] = useState<CustomSettings>({ pLoanAmount: 0, loanLent: 0 });

  // Fetch all schedules and settings on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'loan_schedules'));
        const querySnapshot = await getDocs(q);
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
      
      const loanAmount = data.income;
      const paidAmount = data.expense;
      const dueAmount = loanAmount - paidAmount;
      
      // Get schedule for this department
      const schedule = allSchedules[department] || [];
      
      // Loan Lent: Sum of Input 1 or Custom Setting
      const loanLent = settings?.loanLent ? settings.loanLent : schedule.reduce((sum, row) => {
        const val = parseFloat(row.input1);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      // P.loan Amount: Custom Setting or (Loan Amount / 1000) * 25
      const pLoanAmount = settings?.pLoanAmount ? settings.pLoanAmount : (loanAmount / 1000) * 25;

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
      `Bank Loan - ${item.department}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm, allSchedules, customSettings]);

  const totals = useMemo(() => {
    return loanData.reduce((acc, row) => ({
      loanAmount: acc.loanAmount + row.loanAmount,
      paidAmount: acc.paidAmount + row.paidAmount,
      dueAmount: acc.dueAmount + row.dueAmount,
      loanLent: acc.loanLent + row.loanLent,
      totalPaidAmount: acc.totalPaidAmount + row.totalPaidAmount,
      loanCount: acc.loanCount + 1,
    }), {
      loanAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      loanLent: 0,
      totalPaidAmount: 0,
      loanCount: 0,
    });
  }, [loanData]);

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
      setCurrentSettings(customSettings[department] || { pLoanAmount: 0, loanLent: 0 });
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
        userId: user.uid,
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
        userId: user.uid,
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
    setScheduleRows(scheduleRows.map(r => {
      if (r.id === id) {
        const updatedRow = { ...r, [field]: value };
        
        if (field === 'input1' && selectedLoan) {
          const currentLoanData = loanData.find(l => l.department === selectedLoan.department);
          if (currentLoanData) {
            const input1Val = parseFloat(value);
            if (!isNaN(input1Val)) {
              updatedRow.input2 = (input1Val * currentLoanData.pLoanAmount).toString();
            } else if (value === '') {
              updatedRow.input2 = '';
            }
          }
        }
        
        return updatedRow;
      }
      return r;
    }));
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
    <div className="space-y-3">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Loan Flow</h1>
          <Link 
            to="/dashboard" 
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group shrink-0"
            title="Overview"
          >
            <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Link>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by LoanType..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Total Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Loans */}
        <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02]">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-100 uppercase tracking-tight">Total Loans</p>
            <p className="text-lg font-black text-white leading-none mt-1">{totals.loanCount}</p>
          </div>
        </div>

        {/* Loan Amount */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02]">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-blue-50 uppercase tracking-tight">Loan Amount</p>
            <p className="text-lg font-black text-white leading-none mt-1">{totals.loanAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Paid Amount */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02]">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-emerald-50 uppercase tracking-tight">Paid Amount</p>
            <p className="text-lg font-black text-white leading-none mt-1">{totals.paidAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Due Amount */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02]">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-orange-50 uppercase tracking-tight">Due Amount</p>
            <p className="text-lg font-black text-white leading-none mt-1">{totals.dueAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Loan Lent */}
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02]">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-purple-50 uppercase tracking-tight">Loan Lent</p>
            <p className="text-lg font-black text-white leading-none mt-1">{totals.loanLent.toLocaleString()}</p>
          </div>
        </div>

        {/* T.Paid Amount */}
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-3 rounded-l shadow-sm flex flex-row items-center justify-start space-x-3 hover:shadow-md transition-all hover:scale-[1.02]">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-rose-50 uppercase tracking-tight">T.Paid Amount</p>
            <p className="text-lg font-black text-white leading-none mt-1">{totals.totalPaidAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-1">SL</th>
                <th className="px-4 py-1">LoanType</th>
                <th className="px-4 py-1 text-right">Loan Amount</th>
                <th className="px-4 py-1 text-right">Paid Amount</th>
                <th className="px-4 py-1 text-right">Due Amount</th>
                <th className="px-4 py-1 text-right">Loan Lent</th>
                <th className="px-4 py-1 text-right">P.loan Amount</th>
                <th className="px-4 py-1 text-right">T.Paid Amount</th>
                {!isActionHidden('loan_flow_action') && (
                  <th className="px-4 py-1 text-center">View Details</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loanData.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-1 text-slate-500">{index + 1}</td>
                  <td className="px-4 py-1 font-medium text-slate-800">Bank Loan - {row.department}</td>
                  <td className="px-4 py-1 text-right text-blue-600 font-medium">{row.loanAmount.toLocaleString()}</td>
                  <td className="px-4 py-1 text-right text-green-600 font-medium">{row.paidAmount.toLocaleString()}</td>
                  <td className="px-4 py-1 text-right text-orange-600 font-medium">{row.dueAmount.toLocaleString()}</td>
                  <td className="px-4 py-1 text-right text-purple-600 font-medium">{row.loanLent.toLocaleString()}</td>
                  <td className="px-4 py-1 text-right text-red-600 font-medium">{row.pLoanAmount.toLocaleString()}</td>
                  <td className="px-4 py-1 text-right text-emerald-600 font-medium">{row.totalPaidAmount.toLocaleString()}</td>
                  {!isActionHidden('loan_flow_action') && (
                    <td className="px-4 py-1 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(row.department)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCertificateData(row)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Certificate"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
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

      {/* Mobile View for Main Table */}
      <div className="md:hidden space-y-4">
        {loanData.map((row, index) => (
          <div key={row.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">#{index + 1}</span>
                <h3 className="font-bold text-slate-800">Bank Loan - {row.department}</h3>
              </div>
              {!isActionHidden('loan_flow_action') && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(row.department)}
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCertificateData(row)}
                    className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    title="View Certificate"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-sm">
              <div>
                <p className="text-slate-500 mb-1 text-xs">Loan Amount</p>
                <p className="text-blue-600 font-bold">{row.loanAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 text-xs">Paid Amount</p>
                <p className="text-green-600 font-bold">{row.paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 text-xs">Due Amount</p>
                <p className="text-orange-600 font-bold">{row.dueAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 text-xs">Loan Lent</p>
                <p className="text-purple-600 font-bold">{row.loanLent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 text-xs">P.loan Amount</p>
                <p className="text-red-600 font-bold">{row.pLoanAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 text-xs">T.Paid Amount</p>
                <p className="text-emerald-600 font-bold">{row.totalPaidAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        {loanData.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm">
            No loan data found.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex justify-between items-center w-full md:w-auto">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 flex flex-wrap items-center gap-2">
                  Loan Details: <span className="text-blue-600">Bank Loan - {selectedLoan.department}</span>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-1"
                    title="Custom Settings"
                  >
                    <SettingsIcon className="w-5 h-5" />
                  </button>
                </h2>
                <button 
                  onClick={() => setSelectedLoan(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors md:hidden"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={handleAddRow}
                  className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Month</span><span className="sm:hidden">Add</span>
                </button>
                <button
                  onClick={handleSaveSchedule}
                  disabled={isSaving || isLoadingSchedule}
                  className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm md:text-base"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> <span className="hidden sm:inline">Save</span><span className="sm:hidden">Save</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setSelectedLoan(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors hidden md:block"
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
                  <div className="border border-slate-200 rounded-lg overflow-hidden hidden md:block">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                          <th className="px-4 py-1 text-left w-16">SL</th>
                          <th className="px-4 py-1 text-left w-40">Month</th>
                          <th className="px-4 py-1 text-center w-32">Input 1</th>
                          <th className="px-4 py-1 text-center w-40">Input 2 (Amount)</th>
                          <th className="px-4 py-1 text-center w-32">Status</th>
                          <th className="px-4 py-1 text-center w-16">Action</th>
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

                  {/* Mobile View */}
                  <div className="md:hidden space-y-4">
                    {scheduleRows.map((row, index) => {
                      const status = checkMatch(row, selectedLoan.department);
                      return (
                        <div key={row.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">#{index + 1}</span>
                            <div className="flex items-center gap-2">
                              {status === 'Done' ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  Done
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  No Match
                                </span>
                              )}
                              <button
                                onClick={() => handleRemoveRow(row.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Month</label>
                              <select
                                value={row.month}
                                onChange={(e) => handleRowChange(row.id, 'month', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                {getMonthOptions().map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Input 1</label>
                                <input
                                  type="text"
                                  value={row.input1}
                                  onChange={(e) => handleRowChange(row.id, 'input1', e.target.value)}
                                  className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-medium text-sm"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Input 2 (Amount)</label>
                                <input
                                  type="text"
                                  value={row.input2}
                                  onChange={(e) => handleRowChange(row.id, 'input2', e.target.value)}
                                  className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-bold text-sm"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                  Custom P.loan Amount
                </label>
                <input
                  type="number"
                  value={currentSettings.pLoanAmount || ''}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, pLoanAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom P.loan amount"
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
      {/* Certificate Modal */}
      {certificateData && (
        <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-slate-200">
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
            
            <button 
              onClick={() => setCertificateData(null)}
              className="absolute top-3 right-3 p-1.5 hover:bg-slate-100 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
            
            <div className="p-8 text-center relative">
              {/* Background watermark */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <Award className="w-64 h-64 text-slate-900" />
              </div>
              
              <div className="relative z-10">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-purple-100">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                
                <h2 className="text-2xl font-serif font-bold text-slate-800 mb-1 tracking-tight">Loan Certificate</h2>
                <p className="text-sm text-slate-500 mb-6 uppercase tracking-widest font-semibold">Bank Loan - {certificateData.department}</p>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Loan Amount</p>
                    <p className="text-lg font-bold text-blue-600">{certificateData.loanAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Loan Lent</p>
                    <p className="text-lg font-bold text-purple-600">{certificateData.loanLent.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">T.Paid Amount</p>
                    <p className="text-lg font-bold text-emerald-600">{certificateData.totalPaidAmount.toLocaleString()}</p>
                  </div>
                </div>
                
                {(() => {
                  const excessAmount = certificateData.totalPaidAmount - certificateData.loanAmount;
                  const excessPercentage = certificateData.loanAmount > 0 
                    ? ((excessAmount / certificateData.loanAmount) * 100).toFixed(2) 
                    : 0;
                  
                  return (
                    <div className="bg-slate-800 p-5 rounded-xl text-white shadow-md mx-auto relative overflow-hidden">
                      {/* Decorative background element */}
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
                      
                      <div className="relative z-10">
                        <p className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Excess Paid Analysis</p>
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                          <span className="text-3xl font-bold text-white">+{excessAmount.toLocaleString()}</span>
                          <span className="text-sm font-medium text-slate-400">BDT</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <p className="text-xs font-medium text-emerald-300">
                            {excessPercentage}% more than Loan Amount
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between items-center px-4 text-slate-400 text-xs font-medium">
                  <div className="text-left">
                    <p className="mb-0.5">Date Generated</p>
                    <p className="text-slate-600">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="mb-0.5">Authorized By</p>
                    <p className="text-slate-600 font-serif italic">System Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
