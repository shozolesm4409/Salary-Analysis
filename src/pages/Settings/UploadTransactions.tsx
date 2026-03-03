import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Receipt,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';

export default function UploadTransactions() {
  const { addTransaction } = useTransactions();
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ success: number; total: number; errors: string[] } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    setPreviewData(null);
    const errors: string[] = [];
    const preview: any[] = [];

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
        
        let ws = null;
        let data: any[][] = [];
        for (const name of wb.SheetNames) {
          const sheet = wb.Sheets[name];
          const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          if (sheetData.length > 1) {
            ws = sheet;
            data = sheetData;
            break;
          }
        }

        if (!ws) {
          const firstSheetName = wb.SheetNames[0];
          ws = wb.Sheets[firstSheetName];
          data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        }

        const cleanData = data.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== ''));
        const rows = cleanData.slice(1);
        const total = rows.length;

        if (total === 0) {
          setUploadStatus({ success: 0, total: 0, errors: ['No data rows found in the Excel file. Please ensure your data starts from the second row.'] });
          setUploading(false);
          return;
        }

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            const dataType = String(row[1] || '').trim().toLowerCase();
            const isIncome = dataType === 'income';
            const isExpense = dataType === 'expenses' || dataType === 'expense';

            if (!isIncome && !isExpense) {
              errors.push(`Row ${i + 2}: Invalid Data-Type "${row[1]}" (Expected "Income" or "Expenses")`);
              continue;
            }

            const dateVal = isIncome ? row[2] : row[6];
            const rawCategory = isIncome ? row[3] : row[7];
            const category = rawCategory !== undefined && rawCategory !== null ? String(rawCategory).trim() : '';
            const rawAmount = isIncome ? row[4] : row[8];
            const amount = rawAmount !== undefined && rawAmount !== null ? parseFloat(String(rawAmount)) : 0;
            const rawDept = isIncome ? row[5] : row[9];
            const department = rawDept !== undefined && rawDept !== null ? String(rawDept).trim() : '';

            if (!dateVal || !category || isNaN(amount)) {
              errors.push(`Row ${i + 2}: Missing required data (Date, Category, or Amount)`);
              continue;
            }

            let formattedDate = '';
            if (dateVal instanceof Date) {
              const y = dateVal.getFullYear();
              const m = String(dateVal.getMonth() + 1).padStart(2, '0');
              const d = String(dateVal.getDate()).padStart(2, '0');
              formattedDate = `${y}-${m}-${d}`;
            } else if (typeof dateVal === 'number') {
              try {
                const dateObj = XLSX.SSF.parse_date_code(dateVal);
                const y = dateObj.y;
                const m = String(dateObj.m).padStart(2, '0');
                const d = String(dateObj.d).padStart(2, '0');
                formattedDate = `${y}-${m}-${d}`;
              } catch {
                errors.push(`Row ${i + 2}: Invalid Excel date serial "${dateVal}"`);
                continue;
              }
            } else {
              try {
                const normalizedDateStr = String(dateVal).replace(/-/g, '/');
                const parsedDate = new Date(normalizedDateStr);
                if (!isNaN(parsedDate.getTime())) {
                  const y = parsedDate.getFullYear();
                  const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
                  const d = String(parsedDate.getDate()).padStart(2, '0');
                  formattedDate = `${y}-${m}-${d}`;
                } else {
                  throw new Error('Invalid date');
                }
              } catch {
                errors.push(`Row ${i + 2}: Invalid date format "${dateVal}"`);
                continue;
              }
            }

            preview.push({
              type: isIncome ? 'income' : 'expense',
              date: formattedDate,
              amount,
              category,
              department: department,
              description: '',
              month: formattedDate.substring(0, 7),
              timestamp: Date.now() + i,
            });
          } catch (err: any) {
            errors.push(`Row ${i + 2}: ${err.message || 'Unknown error'}`);
          }
        }

        setPreviewData(preview);
        if (errors.length > 0) {
          setUploadStatus({ success: 0, total: preview.length + errors.length, errors });
        }
        setUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploading(false);
      alert('Error reading file: ' + err.message);
    }
  };

  const handleConfirmUpload = async () => {
    if (!previewData) return;
    setUploading(true);
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < previewData.length; i++) {
      try {
        await addTransaction(previewData[i]);
        successCount++;
      } catch (err: any) {
        errors.push(`Error uploading row ${i + 1}: ${err.message}`);
      }
    }

    setUploadStatus({ 
      success: successCount, 
      total: previewData.length, 
      errors: [...(uploadStatus?.errors || []), ...errors] 
    });
    setPreviewData(null);
    setUploading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileSpreadsheet className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-8">Upload Transactions</h2>

        {!previewData && (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 md:p-12 transition-colors hover:border-blue-400 group relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="space-y-4">
              <div className="flex justify-center">
                {uploading ? (
                  <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-blue-600 animate-spin" />
                ) : (
                  <Upload className="w-10 h-10 md:w-12 md:h-12 text-slate-400 group-hover:text-blue-600 transition-colors" />
                )}
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-slate-700">
                  {uploading ? 'Processing file...' : 'Click here to upload or drag and drop file'}
                </p>
                <p className="text-sm text-slate-500">Supported formats: .xlsx, .xls</p>
              </div>
            </div>
          </div>
        )}

        {previewData && previewData.length > 0 && (
          <div className="mt-8 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Transaction Preview ({previewData.length} items)</h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setPreviewData(null)}
                  className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200">
                      <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Date</th>
                      <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Type</th>
                      <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Category</th>
                      <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-xs text-slate-600">{item.date}</td>
                        <td className="px-3 py-2 text-xs">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-medium uppercase",
                            item.type === 'income' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600 truncate max-w-[100px]">{item.category}</td>
                        <td className={cn(
                          "px-3 py-2 text-xs font-medium text-right",
                          item.type === 'income' ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {uploadStatus && (
          <div className={cn(
            "mt-8 p-4 md:p-6 rounded-xl border text-left",
            uploadStatus.errors.length === 0 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
          )}>
            <div className="flex items-start gap-4">
              {uploadStatus.errors.length === 0 ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-1" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
              )}
              <div className="flex-1">
                <h3 className={cn(
                  "font-bold text-lg",
                  uploadStatus.errors.length === 0 ? "text-emerald-900" : "text-amber-900"
                )}>
                  Upload Completed
                </h3>
                <p className="text-slate-600 mt-1 text-sm">
                  <span className="font-bold text-slate-900">{uploadStatus.success}</span> out of <span className="font-bold text-slate-900">{uploadStatus.total}</span> transactions imported.
                </p>
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link 
                    to="/transactions" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    View Transactions
                  </Link>
                  <button
                    onClick={() => setUploadStatus(null)}
                    className="inline-flex items-center px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Upload New
                  </button>
                </div>
                
                {uploadStatus.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-amber-900 mb-2">Errors ({uploadStatus.errors.length}):</p>
                    <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
                      {uploadStatus.errors.map((err, idx) => (
                        <p key={idx} className="text-[10px] text-amber-800">• {err}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 text-left bg-slate-50 rounded-xl p-4 md:p-6 border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center text-sm md:text-base">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Required Column Format
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200 py-1">
              <span className="text-slate-500">Column B:</span>
              <span className="font-mono font-bold">Data-Type</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1">
              <span className="text-slate-500">Column C:</span>
              <span className="font-mono font-bold">Income Date</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1">
              <span className="text-slate-500">Column D:</span>
              <span className="font-mono font-bold">Income Category</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1">
              <span className="text-slate-500">Column E:</span>
              <span className="font-mono font-bold">Income Amount</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1">
              <span className="text-slate-500">Column G:</span>
              <span className="font-mono font-bold">Expense Date</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1">
              <span className="text-slate-500">Column H:</span>
              <span className="font-mono font-bold">Expense Category</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
