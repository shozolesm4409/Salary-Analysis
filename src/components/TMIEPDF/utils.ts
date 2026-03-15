import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types';

export const generatePDF = (data: Transaction[], title: string) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 30);
  
  const tableColumn = ["Date", "Type", "Category", "Department", "Amount", "Description"];
  const tableRows = data.map(t => [
    t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), 'dd MMM yyyy') : 'Invalid Date',
    t.type,
    t.category,
    t.department,
    t.type === 'income' ? `+${t.amount}` : `-${t.amount}`,
    t.description || ''
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 133, 244] }
  });

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
};
