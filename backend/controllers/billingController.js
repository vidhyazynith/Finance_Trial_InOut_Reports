import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import Company from "../models/Company.js";
import pkg from "number-to-words";

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const { toWords } = pkg;

// Properly define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/payment-proofs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Add customer
export const addCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json({ message: "Customer added successfully", customer: newCustomer });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ message: "Error adding customer", error: error.message });
  }
};

// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers", error: error.message });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Error fetching customer", error: error.message });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json({ message: "Customer updated successfully", customer: updatedCustomer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Error updating customer", error: error.message });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    
    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Error deleting customer", error: error.message });
  }
};

// Update customer status
export const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json({ message: "Customer status updated successfully", customer: updatedCustomer });
  } catch (error) {
    console.error("Error updating customer status:", error);
    res.status(500).json({ message: "Error updating customer status", error: error.message });
  }
};

// Generate dynamic Invoice PDF - FIXED CURRENCY FOR INR
const getCurrencySymbol = (currency) => {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    INR: 'Rs'
  };
  return currencySymbols[currency] || '$';
};

// Fixed amount in words function for INR
const getAmountInWords = (amount, currency) => {
  try {
    const amountInWords = toWords(Math.round(amount));
    
    // Handle different currency names
    if (currency === 'INR') {
      return `${amountInWords} Rupees only`;
    } else if (currency === 'EUR') {
      return `${amountInWords} Euros only`;
    } else {
      return `${amountInWords} Dollars only`;
    }
  } catch (error) {
    console.error("Error converting amount to words:", error);
    if (currency === 'INR') {
      return `${amount} Rupees only`;
    } else if (currency === 'EUR') {
      return `${amount} Euros only`;
    } else {
      return `${amount} Dollars only`;
    }
  }
};

// Format currency amount based on currency type
const formatCurrencyAmount = (amount, currency) => {
  if (currency === 'INR') {
    // Indian numbering system - comma after hundreds, thousands, etc.
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } else {
    // Western numbering system
    return amount.toFixed(2);
  }
};

// Enhanced function to handle payment verification with file upload and storage
export const verifyPayment = async (req, res) => {
  try {
    const { invoiceId, transactionNumber } = req.body;
    const transactionProof = req.file; // Get uploaded file
    
    // Validate required fields
    if (!invoiceId || !transactionNumber) {
      return res.status(400).json({ message: "Invoice ID and transaction number are required" });
    }

    if (!transactionProof) {
      return res.status(400).json({ message: "Transaction proof file is required" });
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedMimeTypes.includes(transactionProof.mimetype)) {
      return res.status(400).json({ 
        message: "Invalid file type. Supported formats: PDF, JPG, PNG, DOC" 
      });
    }

    // Validate file size (10MB max)
    if (transactionProof.size > 10 * 1024 * 1024) {
      return res.status(400).json({ 
        message: "File size too large. Maximum size is 10MB." 
      });
    }

    // Generate unique filename
    const fileExtension = path.extname(transactionProof.originalname);
    const uniqueFileName = `payment-proof-${invoiceId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    // Save file to server
    fs.writeFileSync(filePath, transactionProof.buffer);

    // Construct file URL
    const fileUrl = `/api/billing/payment-proofs/${uniqueFileName}`;

    // Find and update invoice status with file details
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { 
        status: "paid",
        $set: { 
          "paymentDetails.transactionNumber": transactionNumber,
          "paymentDetails.verifiedAt": new Date(),
          "paymentDetails.proofFile": {
            originalName: transactionProof.originalname,
            mimeType: transactionProof.mimetype,
            size: transactionProof.size,
            uploadedAt: new Date(),
            fileName: uniqueFileName,
            filePath: filePath,
            fileUrl: fileUrl
          }
        }
      },
      { new: true, runValidators: true }
    ).populate("customerId");

    if (!updatedInvoice) {
      // Clean up uploaded file if invoice not found
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({ 
      message: "Payment verified successfully", 
      invoice: updatedInvoice 
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Error verifying payment", error: error.message });
  }
};

// Serve payment proof files
export const getPaymentProof = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Set appropriate headers based on file type
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // For images and PDFs, display in browser; for others, download
    if (['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    } else {
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error("Error serving payment proof:", error);
    res.status(500).json({ message: "Error serving file" });
  }
};

// Get payment proof info for a specific invoice
export const getInvoicePaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (!invoice.paymentDetails?.proofFile) {
      return res.status(404).json({ message: "No payment proof found for this invoice" });
    }

    res.json({
      paymentProof: invoice.paymentDetails.proofFile
    });

  } catch (error) {
    console.error("Error fetching payment proof:", error);
    res.status(500).json({ message: "Error fetching payment proof", error: error.message });
  }
};

// Add this function to delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Delete associated payment proof file if exists
    if (invoice.paymentDetails?.proofFile?.filePath) {
      try {
        if (fs.existsSync(invoice.paymentDetails.proofFile.filePath)) {
          fs.unlinkSync(invoice.paymentDetails.proofFile.filePath);
        }
      } catch (fileError) {
        console.error("Error deleting payment proof file:", fileError);
      }
    }

    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    
    res.json({ message: "Invoice deleted successfully" });
    
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Error deleting invoice", error: error.message });
  }
};

// Update the generateInvoice function
export const generateInvoice = async (req, res) => {
  try {
    const { customerId, items, totalAmount, invoiceDate, dueDate, taxPercent, notes, currency } = req.body;

    // Validate required fields
    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ message: "Customer ID and items are required" });
    }

    // Fetch customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Fetch or create company info
    let company = await Company.findOne();
    if (!company) {
      // Create default company info if none exists
      company = await Company.create({
        companyName: 'Zynith IT Solutions',
        address: '123 Business Street, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'contact@zynith-it.com',
        website: 'https://www.zynith-it.com',
        taxId: 'TAX-123456789',
        currency: 'USD',
        fiscalYear: 'January'
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const taxAmount = taxPercent ? (subtotal * taxPercent) / 100 : 0;
    const grandTotal = subtotal + taxAmount;

    // Save invoice in DB with currency and remarks - UPDATED TO INCLUDE REMARKS
    const invoice = new Invoice({
      customerId,
      items: items.map(item => ({
        description: item.description,
        remarks: item.remarks || "", // ADD REMARKS FIELD
        amount: Number(item.amount) || 0
      })),
      totalAmount: grandTotal,
      date: invoiceDate ? new Date(invoiceDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      taxPercent: taxPercent || 0,
      taxAmount,
      subtotal,
      notes,
      currency: currency || "USD",
      status: "sent"
    });
    await invoice.save();

    // Fetch the saved invoice to get the auto-generated numbers
    const savedInvoice = await Invoice.findById(invoice._id).populate("customerId");

    // PDF setup - stream directly to response
    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 50,
      bufferPages: true 
    });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${savedInvoice.invoiceNumber}.pdf`);
    
    doc.pipe(res);

    // ===== DYNAMIC POSITIONING VARIABLES =====
    let currentY = 50;
    const leftColumn = 50;
    const rightColumn = 350;
    const pageWidth = 550;
    const columnWidth = 200;

    // Get currency symbol and name
    const currencySymbol = getCurrencySymbol(currency);
    const amountWords = getAmountInWords(grandTotal, currency);

    // ===== HEADER SECTION WITH LOGO =====
    try {
      // Try to load the logo using the proper path joining
      const logoPath = join(__dirname, 'logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 450, 40, { width: 100 });
      }
      // Company name
      doc.fontSize(20).font('Helvetica-Bold').text(company.companyName, leftColumn, currentY);
    } catch (error) {
      console.log('Could not load logo, proceeding without it:', error.message);
      doc.fontSize(20).font('Helvetica-Bold').text(company.companyName, leftColumn, currentY);
    }

    currentY += 35;

    doc.fontSize(10).font('Helvetica')
       .text(company.address, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Phone: ${company.phone || "000-000-0000"}`, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Email: ${company.email || "contact@company.com"}`, leftColumn, currentY);
    currentY += 15;

    if (company.taxId) {
      doc.text(`GST: ${company.taxId}`, leftColumn, currentY);
      currentY += 15;
    }

    // Horizontal line after header
    currentY += 10;
    doc.moveTo(leftColumn, currentY).lineTo(pageWidth, currentY).stroke();
    currentY += 20;

    // ===== BILL TO SECTION - LEFT SIDE =====
    const billToStartY = currentY;
    doc.fontSize(12).font('Helvetica-Bold').text("BILL TO", leftColumn, currentY);
    currentY += 20;

    doc.fontSize(10).font('Helvetica')
       .text(customer.name, leftColumn, currentY);
    currentY += 15;
    
    if (customer.company) {
      doc.text(customer.company, leftColumn, currentY);
      currentY += 15;
    }
    
    // Handle multi-line address
    const addressLines = customer.address ? doc.heightOfString(customer.address, { width: columnWidth }) : 0;
    if (customer.address) {
      doc.text(customer.address, leftColumn, currentY, { width: columnWidth });
      currentY += addressLines + 10;
    }
    
    doc.text(`Phone: ${customer.phone}`, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Email: ${customer.email}`, leftColumn, currentY);
    
    // Reset currentY to the highest point for right column
    currentY = billToStartY;

    // ===== INVOICE DETAILS SECTION - RIGHT SIDE =====
    doc.fontSize(16).font('Helvetica-Bold').text("INVOICE", rightColumn, currentY);
    currentY += 40;

    // Invoice details in two columns - ADD CURRENCY TO DETAILS
    const detailLabels = ["DATE:", "INVOICE NO:", "CUSTOMER ID:", "DUE DATE:"];
    const invDate = new Date(savedInvoice.date).toISOString().split('T')[0];
    const due = savedInvoice.dueDate ? new Date(savedInvoice.dueDate).toISOString().split('T')[0] : 'N/A';
    const detailValues = [
      invDate,
      savedInvoice.invoiceNumber, // Use auto-generated invoice number
      savedInvoice.customerId.customerId, // Use auto-generated customer ID
      due
    ];

    detailLabels.forEach((label, index) => {
      doc.fontSize(10).font('Helvetica-Bold')
         .text(label, rightColumn, currentY);
      doc.font('Helvetica')
         .text(detailValues[index], rightColumn + 80, currentY);
      currentY += 15;
    });

    // ===== ITEMS TABLE - UPDATED TO INCLUDE REMARKS =====
    // Find the maximum Y position between left and right columns
    const leftColumnBottom = billToStartY + 120; // Approximate bottom of Bill To section
    currentY = Math.max(currentY, leftColumnBottom) + 40;

    // Table headers - UPDATED TO INCLUDE REMARKS COLUMN
    doc.rect(leftColumn, currentY, pageWidth - leftColumn, 20).fill("#f0f0f0");
    doc.fontSize(10).font('Helvetica-Bold').fillColor("#000")
       .text("DESCRIPTION", leftColumn + 10, currentY + 5)
       .text("REMARKS", leftColumn + 200, currentY + 5)
       .text(`AMOUNT (${currencySymbol})`, pageWidth - 60, currentY + 5, { align: "right" });

    currentY += 25;

    // Table rows - UPDATED TO SHOW REMARKS
    items.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(leftColumn, currentY - 5, pageWidth - leftColumn, 20)
           .fillOpacity(0.1).fill("#eeeeee").fillOpacity(1).fillColor('black');
      }
      
      // Handle long descriptions with text wrapping
      const descriptionHeight = doc.heightOfString(item.description, {
        width: 150,
        align: 'left'
      });
      
      const remarksHeight = doc.heightOfString(item.remarks || "-", {
        width: 150,
        align: 'left'
      });
      
      const formattedAmount = formatCurrencyAmount(Number(item.amount), currency);
      
      const rowHeight = Math.max(descriptionHeight, remarksHeight, 20) + 5;
      
      doc.fontSize(10).font('Helvetica')
         .text(item.description, leftColumn + 10, currentY, {
           width: 150,
           align: 'left'
         })
         .text(item.remarks || "-", leftColumn + 170, currentY, {
           width: 150,
           align: 'left'
         })
         .text(`${currencySymbol}${formattedAmount}`, pageWidth - 100, currentY, { 
           align: "right" 
         });
      
      currentY += rowHeight;
    });

    // ===== TOTALS SECTION =====
    currentY += 10;
    
    // Format amounts based on currency
    const formattedSubtotal = formatCurrencyAmount(subtotal, currency);
    const formattedTaxAmount = formatCurrencyAmount(taxAmount, currency);
    const formattedGrandTotal = formatCurrencyAmount(grandTotal, currency);
    
    // Subtotal
    doc.fontSize(10).font('Helvetica')
       .text("Subtotal:", pageWidth - 150, currentY, { align: "left" })
       .text(`${currencySymbol}${formattedSubtotal}`, pageWidth - 100, currentY, { align: "right" });
    currentY += 20;
    
    // Tax
    if (taxPercent > 0) {
      doc.text(`Tax (${taxPercent}%):`, pageWidth - 150, currentY, { align: "left" })
         .text(`${currencySymbol}${formattedTaxAmount}`, pageWidth - 100, currentY, { align: "right" });
      currentY += 20;
    }
    
    // Total
    doc.moveTo(pageWidth - 200, currentY).lineTo(pageWidth, currentY).stroke();
    currentY += 15;
    
    doc.fontSize(12).font('Helvetica-Bold')
       .text("TOTAL:", pageWidth - 150, currentY, { align: "left" })
       .text(`${currencySymbol}${formattedGrandTotal}`, pageWidth - 100, currentY, { align: "right" });
    currentY += 30;

    // ===== AMOUNT IN WORDS =====
    const wordsHeight = doc.heightOfString(amountWords, { width: pageWidth - leftColumn });
    
    doc.fontSize(10).font('Helvetica')
       .text(`Amount in Words: ${amountWords}`, leftColumn, currentY, { 
         width: pageWidth - leftColumn 
       });
    currentY += wordsHeight + 20;

    // ===== OTHER COMMENTS SECTION =====
    doc.fontSize(12).font('Helvetica-Bold').text("OTHER COMMENTS", leftColumn, currentY);
    currentY += 20;

    const defaultComments = [
      "Total payment due in 30 days",
      "Please include the invoice number on your check"
    ];
    
    // Add default comments
    defaultComments.forEach((comment, index) => {
      doc.fontSize(10).font('Helvetica')
         .text(`${index + 1}. ${comment}`, leftColumn + 10, currentY);
      currentY += 15;
    });

    // Add custom notes if provided
    if (notes && notes.trim() !== "") {
      const notesHeight = doc.heightOfString(notes, { width: pageWidth - leftColumn - 20 });
      doc.text(`${defaultComments.length + 1}. ${notes}`, leftColumn + 10, currentY, {
        width: pageWidth - leftColumn - 20
      });
      currentY += notesHeight + 10;
    }

    // ===== CONTACT INFORMATION =====
    currentY += 10;
    const contactText = "If you have any questions about this invoice, please contact";
    const contactInfo = `${company.companyName}, ${company.phone}, ${company.email}`;
    
    const contactHeight = doc.heightOfString(contactText, { width: pageWidth - leftColumn });
    
    doc.fontSize(10).font('Helvetica')
       .text(contactText, leftColumn, currentY, { width: pageWidth - leftColumn })
       .text(contactInfo, leftColumn, currentY + contactHeight + 5);

    // ===== FOOTER =====
    const footerY = 750;
    doc.moveTo(leftColumn, footerY).lineTo(pageWidth, footerY).stroke();
    doc.fontSize(12).font('Helvetica-Bold')
       .text("Thank You For Your Business!", (leftColumn + pageWidth) / 2, footerY + 15, { align: "center" });

    doc.end();

  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: "Error generating invoice", error: error.message });
  }
};

// Update the downloadInvoice function to include remarks
export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch invoice with customer details
    const invoice = await Invoice.findById(id).populate("customerId");
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Fetch company info
    let company = await Company.findOne();
    if (!company) {
      company = {
        companyName: 'Zynith IT Solutions',
        address: '123 Business Street, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'contact@zynith-it.com',
        website: 'https://www.zynith-it.com',
        taxId: 'TAX-123456789',
        currency: 'USD',
        fiscalYear: 'January' 
      };
    }

    // Use the same PDF generation logic from generateInvoice function
    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 50,
      bufferPages: true 
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    // ===== DYNAMIC POSITIONING VARIABLES =====
    let currentY = 50;
    const leftColumn = 50;
    const rightColumn = 350;
    const pageWidth = 550;
    const columnWidth = 200;

    // Get currency symbol and name for existing invoice
    const currencySymbol = getCurrencySymbol(invoice.currency);
    const amountWords = getAmountInWords(invoice.totalAmount, invoice.currency);

    // ===== HEADER SECTION =====
    doc.fontSize(20).font('Helvetica-Bold').text(company.companyName, leftColumn, currentY);
    currentY += 35;

    doc.fontSize(10).font('Helvetica')
       .text(company.address, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Phone: ${company.phone || "000-000-0000"}`, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Email: ${company.email || "contact@company.com"}`, leftColumn, currentY);
    currentY += 15;

    if (company.taxId) {
      doc.text(`GST: ${company.taxId}`, leftColumn, currentY);
      currentY += 15;
    }

    // Horizontal line after header
    currentY += 10;
    doc.moveTo(leftColumn, currentY).lineTo(pageWidth, currentY).stroke();
    currentY += 20;

    // ===== BILL TO SECTION - LEFT SIDE =====
    const billToStartY = currentY;
    doc.fontSize(12).font('Helvetica-Bold').text("BILL TO", leftColumn, currentY);
    currentY += 20;

    doc.fontSize(10).font('Helvetica')
       .text(invoice.customerId.name, leftColumn, currentY);
    currentY += 15;
    
    if (invoice.customerId.company) {
      doc.text(invoice.customerId.company, leftColumn, currentY);
      currentY += 15;
    }
    
    // Handle multi-line address
    const addressLines = invoice.customerId.address ? doc.heightOfString(invoice.customerId.address, { width: columnWidth }) : 0;
    if (invoice.customerId.address) {
      doc.text(invoice.customerId.address, leftColumn, currentY, { width: columnWidth });
      currentY += addressLines + 10;
    }
    
    doc.text(`Phone: ${invoice.customerId.phone}`, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Email: ${invoice.customerId.email}`, leftColumn, currentY);
    
    // Reset currentY to the highest point for right column
    currentY = billToStartY;

    // ===== INVOICE DETAILS SECTION - RIGHT SIDE =====
    doc.fontSize(16).font('Helvetica-Bold').text("INVOICE", rightColumn, currentY);
    currentY += 40;

    // Invoice details in two columns - ADD CURRENCY
    const detailLabels = ["DATE:", "INVOICE NO:", "CUSTOMER ID:", "DUE DATE:"];
    const invDate = new Date(invoice.date).toISOString().split('T')[0];
    const due = invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : 'N/A';
    const detailValues = [
      invDate,
      invoice.invoiceNumber, // Use from database
      invoice.customerId.customerId, // Use from database
      due
    ];

    detailLabels.forEach((label, index) => {
      doc.fontSize(10).font('Helvetica-Bold')
         .text(label, rightColumn, currentY);
      doc.font('Helvetica')
         .text(detailValues[index], rightColumn + 80, currentY);
      currentY += 15;
    });

    // ===== ITEMS TABLE - UPDATED TO INCLUDE REMARKS =====
    const leftColumnBottom = billToStartY + 120;
    currentY = Math.max(currentY, leftColumnBottom) + 40;

    // Table headers - UPDATED TO INCLUDE REMARKS COLUMN
    doc.rect(leftColumn, currentY, pageWidth - leftColumn, 20).fill("#f0f0f0");
    doc.fontSize(10).font('Helvetica-Bold').fillColor("#000")
       .text("DESCRIPTION", leftColumn + 10, currentY + 5)
       .text("REMARKS", leftColumn + 200, currentY + 5)
       .text(`AMOUNT (${currencySymbol})`, pageWidth - 60, currentY + 5, { align: "right" });

    currentY += 25;

    // Table rows - UPDATED TO SHOW REMARKS
    invoice.items.forEach((item, index) => {
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }

      if (index % 2 === 0) {
        doc.rect(leftColumn, currentY - 5, pageWidth - leftColumn, 20)
           .fillOpacity(0.1).fill("#eeeeee").fillOpacity(1).fillColor('black');
      }
      
      const descriptionHeight = doc.heightOfString(item.description, {
        width: 150,
        align: 'left'
      });
      
      const remarksHeight = doc.heightOfString(item.remarks || "-", {
        width: 150,
        align: 'left'
      });
      
      const formattedAmount = formatCurrencyAmount(Number(item.amount), invoice.currency);
      
      const rowHeight = Math.max(descriptionHeight, remarksHeight, 20) + 5;
      
      doc.fontSize(10).font('Helvetica')
         .text(item.description, leftColumn + 10, currentY, {
           width: 150,
           align: 'left'
         })
         .text(item.remarks || "-", leftColumn + 170, currentY, {
           width: 150,
           align: 'left'
         })
         .text(`${currencySymbol}${formattedAmount}`, pageWidth - 100, currentY, { 
           align: "right" 
         });
      
      currentY += rowHeight;
    });

    // ===== TOTALS SECTION =====
    currentY += 10;
    
    // Format amounts based on currency
    const formattedSubtotal = formatCurrencyAmount(invoice.subtotal, invoice.currency);
    const formattedTaxAmount = formatCurrencyAmount(invoice.taxAmount, invoice.currency);
    const formattedGrandTotal = formatCurrencyAmount(invoice.totalAmount, invoice.currency);
    
    // Subtotal
    doc.fontSize(10).font('Helvetica')
       .text("Subtotal:", pageWidth - 150, currentY, { align: "left" })
       .text(`${currencySymbol}${formattedSubtotal}`, pageWidth - 100, currentY, { align: "right" });
    currentY += 20;
    
    // Tax
    if (invoice.taxPercent > 0) {
      doc.text(`Tax (${invoice.taxPercent}%):`, pageWidth - 150, currentY, { align: "left" })
         .text(`${currencySymbol}${formattedTaxAmount}`, pageWidth - 100, currentY, { align: "right" });
      currentY += 20;
    }
    
    // Total
    doc.moveTo(pageWidth - 200, currentY).lineTo(pageWidth, currentY).stroke();
    currentY += 15;
    
    doc.fontSize(12).font('Helvetica-Bold')
       .text("TOTAL:", pageWidth - 150, currentY, { align: "left" })
       .text(`${currencySymbol}${formattedGrandTotal}`, pageWidth - 100, currentY, { align: "right" });
    currentY += 30;

    // ===== AMOUNT IN WORDS =====
    const wordsHeight = doc.heightOfString(amountWords, { width: pageWidth - leftColumn });
    
    doc.fontSize(10).font('Helvetica')
       .text(`Amount in Words: ${amountWords}`, leftColumn, currentY, { 
         width: pageWidth - leftColumn 
       });
    currentY += wordsHeight + 20;

    // ===== OTHER COMMENTS SECTION =====
    if (invoice.notes) {
      doc.fontSize(12).font('Helvetica-Bold').text("OTHER COMMENTS", leftColumn, currentY);
      currentY += 20;
      doc.fontSize(10).font('Helvetica')
         .text(invoice.notes, leftColumn + 10, currentY, { width: pageWidth - leftColumn - 20 });
      currentY += 20;
    }

    // ===== FOOTER =====
    const footerY = 750;
    doc.moveTo(leftColumn, footerY).lineTo(pageWidth, footerY).stroke();
    doc.fontSize(12).font('Helvetica-Bold')
       .text("Thank You For Your Business!", (leftColumn + pageWidth) / 2, footerY + 15, { align: "center" });

    doc.end();

  } catch (error) {
    console.error("Error downloading invoice:", error);
    res.status(500).json({ message: "Error downloading invoice", error: error.message });
  }
};

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customerId", "name email phone")
      .sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Error fetching invoices", error: error.message });
  }
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId");
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Error fetching invoice", error: error.message });
  }
};

