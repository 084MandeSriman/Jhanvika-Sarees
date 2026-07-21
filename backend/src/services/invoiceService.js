const PDFDocument = require('pdfkit')

const BRAND = process.env.EMAIL_NAME || 'Jhanvika Sarees'

/**
 * Streams a PDF invoice for the given order directly to an HTTP response.
 * Kept intentionally simple (no external template engine) since pdfkit's
 * drawing API is all we need for a single-page invoice.
 */
function streamInvoice(order, res) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`)
  doc.pipe(res)

  doc.fillColor('#6B1E3C').fontSize(22).text(BRAND, { align: 'left' })
  doc.fillColor('#2B1B17').fontSize(10).text('Banjara Hills, Hyderabad, Telangana, India')
  doc.moveDown(1.5)

  doc.fontSize(16).text('Tax Invoice', { align: 'right' })
  doc.fontSize(10).fillColor('#555')
    .text(`Invoice / Order #: ${order.orderNumber}`, { align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, { align: 'right' })
    .text(`Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}`, { align: 'right' })
  doc.moveDown(1)

  doc.fillColor('#2B1B17').fontSize(11).text('Billed To:', { underline: true })
  const addr = order.shippingAddress || {}
  doc.fontSize(10)
    .text(addr.fullName || '')
    .text(addr.line1 || '')
    .text(`${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`)
    .text(addr.phone || '')
  doc.moveDown(1.5)

  // Items table
  const tableTop = doc.y
  doc.font('Helvetica-Bold').fontSize(10)
  doc.text('Item', 50, tableTop)
  doc.text('Qty', 320, tableTop, { width: 60, align: 'right' })
  doc.text('Price', 390, tableTop, { width: 70, align: 'right' })
  doc.text('Total', 470, tableTop, { width: 80, align: 'right' })
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#ddd').stroke()

  doc.font('Helvetica').fontSize(10)
  let y = tableTop + 22
  ;(order.items || []).forEach((item) => {
    doc.text(item.name, 50, y, { width: 260 })
    doc.text(String(item.qty), 320, y, { width: 60, align: 'right' })
    doc.text(`₹${Number(item.price).toLocaleString('en-IN')}`, 390, y, { width: 70, align: 'right' })
    doc.text(`₹${(item.price * item.qty).toLocaleString('en-IN')}`, 470, y, { width: 80, align: 'right' })
    y += 20
  })

  doc.moveTo(50, y + 4).lineTo(550, y + 4).strokeColor('#ddd').stroke()
  y += 14

  const totals = [
    ['Subtotal', order.subtotal],
    ...(order.discount > 0 ? [['Discount', -order.discount]] : []),
    ['GST', order.tax],
    ['Shipping', order.shippingFee],
  ]
  totals.forEach(([label, val]) => {
    doc.text(label, 390, y, { width: 70, align: 'right' })
    doc.text(`₹${Number(val).toLocaleString('en-IN')}`, 470, y, { width: 80, align: 'right' })
    y += 16
  })

  doc.font('Helvetica-Bold')
  doc.text('Grand Total', 390, y, { width: 70, align: 'right' })
  doc.text(`₹${Number(order.total).toLocaleString('en-IN')}`, 470, y, { width: 80, align: 'right' })

  doc.moveDown(4)
  doc.font('Helvetica').fontSize(9).fillColor('#888')
    .text('This is a computer-generated invoice and does not require a signature.', 50, doc.y, { align: 'center', width: 500 })

  doc.end()
}

module.exports = { streamInvoice }
