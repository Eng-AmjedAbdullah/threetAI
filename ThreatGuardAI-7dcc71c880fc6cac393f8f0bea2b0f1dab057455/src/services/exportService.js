import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'

/**
 * Export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Optional filename
 */
export function exportToCSV(data, filename = 'threatguard-export') {
  if (!data || !data.length) return

  const headers = Object.keys(data[0])
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(','))

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header]
      const escaped = ('' + val).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export scan history to PDF
 * @param {Array} data - Array of scan objects
 * @param {string} title - Report title
 */
export function exportToPDF(data, title = 'Security Audit Report') {
  const doc = new jsPDF()
  const timestamp = format(new Date(), 'PPP p')

  // Header
  doc.setFontSize(22)
  doc.setTextColor(13, 27, 62) // Navy 900
  doc.text('ThreatGuardAI', 14, 22)
  
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Advanced Network Intrusion Detection System', 14, 28)
  
  doc.setDrawColor(226, 232, 240) // Navy 100
  doc.line(14, 32, 196, 32)

  // Title & Date
  doc.setFontSize(16)
  doc.setTextColor(13, 27, 62)
  doc.text(title, 14, 45)
  
  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.text(`Generated on: ${timestamp}`, 14, 52)

  // Summary Stats
  const attacks = data.filter(d => d.verdict === 'ATTACK').length
  const normal = data.length - attacks
  const avgConfidence = data.reduce((acc, d) => acc + d.confidence, 0) / data.length

  doc.setFontSize(11)
  doc.setTextColor(13, 27, 62)
  doc.text('Executive Summary', 14, 65)
  
  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(`Total Scans Analyzed: ${data.length}`, 14, 72)
  doc.text(`Threats Detected: ${attacks}`, 14, 77)
  doc.text(`Normal Traffic: ${normal}`, 14, 82)
  doc.text(`Average Detection Confidence: ${Math.round(avgConfidence * 100)}%`, 14, 87)

  // Table
  const tableData = data.map(scan => [
    `#${String(scan.id).slice(-4).toUpperCase()}`,
    scan.inputMode?.toUpperCase() || 'MANUAL',
    scan.verdict,
    `${Math.round(scan.confidence * 100)}%`,
    scan.totalRecords || 1,
    scan.createdAt ? format(new Date(scan.createdAt), 'MMM d, HH:mm') : '—'
  ])

  doc.autoTable({
    startY: 95,
    head: [['ID', 'Mode', 'Verdict', 'Confidence', 'Records', 'Date']],
    body: tableData,
    headStyles: { fillColor: [13, 27, 62], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    margin: { top: 95 },
    styles: { fontSize: 8, cellPadding: 3 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === 'ATTACK') {
          data.cell.styles.textColor = [220, 38, 38] // Red 600
          data.cell.styles.fontStyle = 'bold'
        } else {
          data.cell.styles.textColor = [5, 150, 105] // Emerald 600
        }
      }
    }
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Page ${i} of ${pageCount} — ThreatGuardAI Compliance Report — Confidential`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}
