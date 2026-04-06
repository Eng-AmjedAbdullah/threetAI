import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export interface ScanData {
  id: string | number;
  input_mode: string;
  filename?: string;
  verdict: string;
  confidence: number;
  total_records: number;
  created_at: string;
  details?: any;
}

/**
 * Exports scan history to a CSV file.
 */
export const exportToCSV = (data: ScanData[], filename = 'security_audit_history.csv') => {
  if (!data || data.length === 0) return;

  const headers = ['Scan ID', 'Mode', 'Filename', 'Verdict', 'Confidence', 'Total Records', 'Date'];
  const rows = data.map(scan => [
    `#${String(scan.id).padStart(4, '0')}`,
    scan.input_mode,
    scan.filename || 'N/A',
    scan.verdict,
    `${Math.round(scan.confidence * 100)}%`,
    scan.total_records || 1,
    format(new Date(scan.created_at), 'yyyy-MM-dd HH:mm:ss')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports scan history or a single scan to a PDF report.
 */
export const exportToPDF = (data: ScanData | ScanData[], title = 'Security Audit Report') => {
  const doc = new jsPDF();
  const isArray = Array.isArray(data);
  const scans = isArray ? data : [data];

  // Header
  doc.setFontSize(20);
  doc.setTextColor(13, 27, 62); // navy-900
  doc.text('ThreatGuardAI', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // navy-400
  doc.text('Intelligent Intrusion Detection System', 14, 28);
  
  doc.setFontSize(16);
  doc.setTextColor(13, 27, 62);
  doc.text(title, 14, 45);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 14, 52);
  doc.text(`Total Records: ${scans.length}`, 14, 58);

  // Table
  const tableColumn = ["ID", "Mode", "Verdict", "Confidence", "Records", "Date"];
  const tableRows = scans.map(scan => [
    `#${String(scan.id).padStart(4, '0')}`,
    scan.input_mode.toUpperCase(),
    scan.verdict,
    `${Math.round(scan.confidence * 100)}%`,
    scan.total_records || 1,
    format(new Date(scan.created_at), 'MMM d, yyyy HH:mm')
  ]);

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 65,
    theme: 'striped',
    headStyles: { fillColor: [13, 27, 62], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    margin: { top: 65 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} - ThreatGuardAI Security Audit Report`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const fileName = isArray 
    ? `security_audit_report_${format(new Date(), 'yyyyMMdd')}.pdf`
    : `scan_report_${data.id}.pdf`;

  doc.save(fileName);
};
