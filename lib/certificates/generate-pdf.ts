import { jsPDF } from 'jspdf'

interface CertificateData {
  userName: string
  courseName: string
  completionDate: Date
  lessonCount: number
}

export function generateCertificatePDF(data: CertificateData): Blob {
  // Create new PDF document (landscape A4)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Add decorative border
  doc.setDrawColor(255, 237, 0) // #ffed00 yellow
  doc.setLineWidth(3)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  // Add inner border
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

  // BlackBoard logo/text (top)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('BlackBoard', pageWidth / 2, 35, { align: 'center' })

  // Subtitle
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('TRAINING & CERTIFICATION', pageWidth / 2, 43, { align: 'center' })

  // Certificate of Completion title
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Certificate of Completion', pageWidth / 2, 65, { align: 'center' })

  // Divider line
  doc.setDrawColor(255, 237, 0)
  doc.setLineWidth(1)
  doc.line(60, 70, pageWidth - 60, 70)

  // "This certifies that" text
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text('This certifies that', pageWidth / 2, 85, { align: 'center' })

  // Student name (highlighted)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(data.userName, pageWidth / 2, 100, { align: 'center' })

  // Underline for name
  const nameWidth = doc.getTextWidth(data.userName)
  doc.setDrawColor(255, 237, 0)
  doc.setLineWidth(0.5)
  doc.line(
    pageWidth / 2 - nameWidth / 2 - 5,
    102,
    pageWidth / 2 + nameWidth / 2 + 5,
    102
  )

  // "has successfully completed" text
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text('has successfully completed', pageWidth / 2, 115, { align: 'center' })

  // Course name
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)

  // Wrap course name if too long
  const maxWidth = pageWidth - 80
  const courseNameLines = doc.splitTextToSize(data.courseName, maxWidth)
  const courseNameY = 130
  doc.text(courseNameLines, pageWidth / 2, courseNameY, { align: 'center' })

  // Completion details
  const detailsY = courseNameY + (courseNameLines.length * 7) + 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Completed ${data.lessonCount} lessons on ${data.completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageWidth / 2,
    detailsY,
    { align: 'center' }
  )

  // Signature line and date (bottom)
  const signatureY = pageHeight - 40

  // Signature line
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  doc.line(50, signatureY, 110, signatureY)

  // Signature label
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text('Gregor Wallner', 80, signatureY + 5, { align: 'center' })
  doc.text('BlackBoard Founder & Head Coach', 80, signatureY + 10, { align: 'center' })

  // Date
  doc.line(pageWidth - 110, signatureY, pageWidth - 50, signatureY)
  doc.text('Date of Completion', pageWidth - 80, signatureY + 5, { align: 'center' })
  doc.text(data.completionDate.toLocaleDateString('en-US'), pageWidth - 80, signatureY + 10, { align: 'center' })

  // Yellow accent corners
  doc.setFillColor(255, 237, 0)
  doc.triangle(15, 15, 25, 15, 15, 25, 'F')
  doc.triangle(pageWidth - 15, 15, pageWidth - 25, 15, pageWidth - 15, 25, 'F')
  doc.triangle(15, pageHeight - 15, 25, pageHeight - 15, 15, pageHeight - 25, 'F')
  doc.triangle(pageWidth - 15, pageHeight - 15, pageWidth - 25, pageHeight - 15, pageWidth - 15, pageHeight - 25, 'F')

  // Certificate ID (small text at bottom)
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  const certId = `BB-${Date.now().toString(36).toUpperCase()}`
  doc.text(`Certificate ID: ${certId}`, pageWidth / 2, pageHeight - 8, { align: 'center' })
  doc.text('blackboard-training.com', pageWidth / 2, pageHeight - 4, { align: 'center' })

  // Return as blob
  return doc.output('blob')
}

export function downloadCertificatePDF(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
