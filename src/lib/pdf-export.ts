import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FORMATS, type FormatKey, type Entry, type Vote } from './types'

// PDF-friendly category colors (RGB tuples)
const CATEGORY_COLORS: Record<string, [number, number, number]> = {
  // Start/Stop/Continue
  start: [16, 185, 129],    // emerald-500
  stop: [244, 63, 94],      // rose-500
  continue: [14, 165, 233], // sky-500
  // Mad/Sad/Glad
  mad: [249, 115, 22],      // orange-500
  sad: [99, 102, 241],      // indigo-500
  glad: [20, 184, 166],     // teal-500
  // Liked/Learned/Lacked
  liked: [236, 72, 153],    // pink-500
  learned: [245, 158, 11],  // amber-500
  lacked: [100, 116, 139],  // slate-500
}

const DEFAULT_COLOR: [number, number, number] = [107, 114, 128] // gray-500

function getCategoryColor(category: string): [number, number, number] {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR
}

// Lighten a color for backgrounds (mix with white)
function lightenColor(color: [number, number, number], amount: number = 0.85): [number, number, number] {
  return [
    Math.round(color[0] + (255 - color[0]) * amount),
    Math.round(color[1] + (255 - color[1]) * amount),
    Math.round(color[2] + (255 - color[2]) * amount),
  ]
}

interface PdfExportData {
  title: string
  format: FormatKey
  createdAt: number
  entries: Entry[]
  votes: Vote[]
  aiSummary?: string | null
  locale: string
  translations: {
    exportTitle: string
    categoryLabels: Record<string, string>
    formatName: string
    votesLabel: string
    summaryTitle: string
    noEntries: string
    generatedAt: string
  }
}

export function generateRetroPdf(data: PdfExportData): void {
  const {
    title,
    format,
    createdAt,
    entries,
    votes,
    aiSummary,
    locale,
    translations: t,
  } = data

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // --- Header ---
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text(title, margin, y)
  y += 10

  // Format + date line
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const dateStr = new Date(createdAt).toLocaleDateString(
    locale === 'it' ? 'it-IT' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )
  doc.text(`${t.formatName}  •  ${dateStr}`, margin, y)
  y += 4

  // Divider
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // --- AI Summary (if available) ---
  if (aiSummary && aiSummary.trim()) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(109, 40, 217) // purple-600
    doc.text(t.summaryTitle, margin, y)
    y += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 55, 55)

    const summaryLines = doc.splitTextToSize(aiSummary, contentWidth)
    
    // Check if we need a new page
    const summaryHeight = summaryLines.length * 5
    if (y + summaryHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      y = margin
    }

    // Summary background box
    doc.setFillColor(245, 240, 255) // light purple bg
    doc.roundedRect(margin - 2, y - 4, contentWidth + 4, summaryHeight + 8, 2, 2, 'F')

    doc.text(summaryLines, margin, y)
    y += summaryHeight + 12
  }

  // --- Entries by Category ---
  const formatDef = FORMATS[format]
  if (!formatDef) return

  const getVoteCount = (entryId: string): number => {
    return votes
      .filter(v => v.entryId === entryId)
      .reduce((sum, v) => sum + v.value, 0)
  }

  for (const category of formatDef.categories) {
    const categoryEntries = entries.filter(e => e.category === category)
    const color = getCategoryColor(category)
    const lightColor = lightenColor(color)

    // Check if enough space for header + at least one row
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage()
      y = margin
    }

    // Category header
    doc.setFillColor(...color)
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    const categoryLabel = t.categoryLabels[category] || category
    doc.text(`${categoryLabel}  (${categoryEntries.length})`, margin + 4, y + 6.5)
    y += 13

    if (categoryEntries.length === 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text(t.noEntries, margin + 4, y)
      y += 10
    } else {
      // Table of entries
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [],
        body: categoryEntries.map((entry) => {
          const voteCount = getVoteCount(entry._id)
          const voteStr = voteCount > 0 ? `+${voteCount}` : voteCount.toString()
          return [entry.content, voteStr]
        }),
        columnStyles: {
          0: { cellWidth: contentWidth - 18 },
          1: {
            cellWidth: 16,
            halign: 'center',
            fontStyle: 'bold',
            fontSize: 10,
          },
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
          lineColor: [230, 230, 230],
          lineWidth: 0.3,
          textColor: [40, 40, 40],
        },
        alternateRowStyles: {
          fillColor: lightColor,
        },
        theme: 'grid',
        didParseCell: (hookData) => {
          // Style vote column
          if (hookData.column.index === 1) {
            const value = parseInt(hookData.cell.text[0])
            if (value > 0) {
              hookData.cell.styles.textColor = [16, 185, 129] // green
            } else if (value < 0) {
              hookData.cell.styles.textColor = [244, 63, 94] // red
            } else {
              hookData.cell.styles.textColor = [150, 150, 150] // grey
            }
          }
        },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 10
    }
  }

  // --- Footer ---
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(170, 170, 170)

    const footerY = doc.internal.pageSize.getHeight() - 10
    const generatedStr = `${t.generatedAt} ${new Date().toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US')} — RetroShift`
    doc.text(generatedStr, margin, footerY)
    doc.text(`${i} / ${pageCount}`, pageWidth - margin, footerY, { align: 'right' })
  }

  // --- Download ---
  const safeTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase()
  doc.save(`retroshift-${safeTitle}.pdf`)
}
