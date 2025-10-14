// import Customer from "../models/Customer.js";
// import Invoice from "../models/Invoice.js";

// // Get all customers
// export const getCustomers = async (req, res) => {
//   const customers = await Customer.find();
//   res.json(customers);
// };

// // Add customer
// export const addCustomer = async (req, res) => {
//   const newCustomer = new Customer(req.body);
//   await newCustomer.save();
//   res.status(201).json({ message: "Customer added", newCustomer });
// };

// // Generate invoice
// export const generateInvoice = async (req, res) => {
//   const { customerId, items, totalAmount } = req.body;
//   const customer = await Customer.findById(customerId);
//   if (!customer) return res.status(404).json({ message: "Customer not found" });

//   const invoice = new Invoice({ customerId, items, totalAmount });
//   await invoice.save();

//   res.json({
//     message: "Invoice generated",
//     invoice: {
//       invoiceId: invoice._id,
//       customer: customer.name,
//       items,
//       totalAmount,
//       date: invoice.date.toISOString().split("T")[0],
//     },
//   });
// };


// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import Customer from "../models/Customer.js";
// import Invoice from "../models/Invoice.js";
// import Company from "../models/Company.js";
// //import { toWords } from "number-to-words";
// import pkg from "number-to-words";
// const { toWords } = pkg;

// // Add customer
// export const addCustomer = async (req, res) => {
//   const newCustomer = new Customer(req.body);
//   await newCustomer.save();
//   res.status(201).json({ message: "Customer added", newCustomer });
// };

// // Get all customers
// export const getCustomers = async (req, res) => {
//   const customers = await Customer.find();
//   res.json(customers);
// };

// // Generate dynamic Invoice PDF
// export const generateInvoice = async (req, res) => {
//   try {
//     const { customerId, items, totalAmount, invoiceDate, dueDate, taxPercent, notes } = req.body;

//     // Fetch customer
//     const customer = await Customer.findById(customerId);
//     if (!customer) return res.status(404).json({ message: "Customer not found" });

//     // Fetch company info
//     const company = await Company.findOne();
//     if (!company) return res.status(500).json({ message: "Company info missing" });

//     // Save invoice in DB
//     const invoice = new Invoice({
//       customerId,
//       items,
//       totalAmount,
//       date: invoiceDate ? new Date(invoiceDate) : new Date(),
//     });
//     await invoice.save();

//     // PDF setup
//     const doc = new PDFDocument({ size: "A4", margin: 50 });
//     const invoiceName = `Invoice-${invoice._id}.pdf`;
//     const filePath = path.join("invoices", invoiceName);
//     fs.mkdirSync("invoices", { recursive: true });
//     const writeStream = fs.createWriteStream(filePath);
//     doc.pipe(writeStream);

//     // ===== HEADER =====
//     if (company.logoUrl) {
//       try { doc.image(company.logoUrl, 50, 45, { width: 100 }); } catch (err) {}
//     }
//     doc.fontSize(20).text(company.name, 50, 50);
//     doc.fontSize(10).text(company.address);
//     doc.text(`Email: ${company.email} | Phone: ${company.phone}`);
//     if (company.gst) doc.text(`GSTIN: ${company.gst}`);
//     doc.moveDown();

//     // ===== CUSTOMER INFO =====
//     doc.fontSize(12).text("Bill To:", 50, doc.y + 20);
//     doc.fontSize(10).text(customer.name);
//     doc.text(customer.email);
//     doc.text(customer.address);

//     // ===== INVOICE INFO =====
//     doc.fontSize(12).text(`Invoice #: ${invoice._id}`, 400, 150);
//     doc.text(`Invoice Date: ${invoice.date.toISOString().split("T")[0]}`, { align: "right" });
//     if (dueDate) doc.text(`Due Date: ${dueDate}`, { align: "right" });

//     // ===== ITEMS TABLE =====
//     const tableTop = 230;
//     const itemDescX = 50;
//     const itemAmountX = 400;

//     // Table header
//     doc.fontSize(12).text("Description", itemDescX, tableTop);
//     doc.text("Amount (₹)", itemAmountX, tableTop, { align: "right" });

//     let position = tableTop + 20;
//     items.forEach((item, index) => {
//       // Alternate row color
//       if (index % 2 === 0) doc.rect(itemDescX - 2, position - 2, 500, 20).fillOpacity(0.05).fill("#eeeeee").fillOpacity(1);
//       doc.fontSize(10).fillColor("#000").text(item.description, itemDescX, position);
//       doc.text(item.amount.toFixed(2), itemAmountX, position, { align: "right" });
//       position += 20;
//     });

//     // ===== TOTALS =====
//     const taxAmount = taxPercent ? (totalAmount * taxPercent) / 100 : 0;
//     const grandTotal = totalAmount + taxAmount;

//     doc.moveTo(itemDescX, position).lineTo(550, position).stroke();
//     position += 10;

//     doc.fontSize(10).text(`Subtotal: ₹${totalAmount.toFixed(2)}`, itemAmountX, position, { align: "right" });
//     position += 20;
//     doc.text(`Tax (${taxPercent || 0}%): ₹${taxAmount.toFixed(2)}`, itemAmountX, position, { align: "right" });
//     position += 20;
//     doc.fontSize(12).text(`Total: ₹${grandTotal.toFixed(2)}`, itemAmountX, position, { align: "right", bold: true });
//     position += 20;

//     doc.fontSize(10).text(`Amount in Words: ${toWords(grandTotal)} Only`, itemDescX, position);

//     // ===== PAYMENT INFO =====
//     if (company.bankDetails) {
//       position += 30;
//       doc.fontSize(10).text("Payment Details:", itemDescX, position);
//       const bank = company.bankDetails;
//       doc.text(`Bank: ${bank.bankName}`);
//       doc.text(`Account: ${bank.accountNumber} (${bank.accountName})`);
//       doc.text(`IFSC: ${bank.ifsc}`);
//       if (bank.upiId) doc.text(`UPI ID: ${bank.upiId}`);
//       if (bank.paymentLink) doc.text(`Payment Link: ${bank.paymentLink}`);
//     }

//     // ===== NOTES =====
//     if (notes) {
//       position += 50;
//       doc.fontSize(10).text("Notes:", itemDescX, position);
//       doc.text(notes);
//     }

//     doc.end();

//     writeStream.on("finish", () => {
//       res.json({ message: "Invoice generated", pdf: `/invoices/${invoiceName}` });
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error generating invoice" });
//   }
// };

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import Company from "../models/Company.js";
import pkg from "number-to-words";
const { toWords } = pkg;

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

// Generate dynamic Invoice PDF - FIXED ALIGNMENT
export const generateInvoice = async (req, res) => {
  try {
    const { customerId, items, totalAmount, invoiceDate, dueDate, taxPercent, notes } = req.body;

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
        name: "Zynith IT Solutions",
        address: "123 Business Street, City, ST 12345",
        email: "admin@zynith-it.com",
        phone: "000-000-0000",
        gst: "GSTIN123456789"
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const taxAmount = taxPercent ? (subtotal * taxPercent) / 100 : 0;
    const grandTotal = subtotal + taxAmount;

    // Save invoice in DB
    const invoice = new Invoice({
      customerId,
      items: items.map(item => ({
        description: item.description,
        amount: Number(item.amount) || 0
      })),
      totalAmount: grandTotal,
      date: invoiceDate ? new Date(invoiceDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate): null,
      taxPercent: taxPercent || 0,
      taxAmount,
      subtotal,
      notes,
      status: "sent"
    });
    await invoice.save();

    // PDF setup - stream directly to response
    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 50,
      bufferPages: true 
    });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice._id}.pdf`);
    
    doc.pipe(res);

    // ===== DYNAMIC POSITIONING VARIABLES =====
    let currentY = 50;
    const leftColumn = 50;
    const rightColumn = 350;
    const pageWidth = 550;
    const columnWidth = 200;

    // ===== HEADER SECTION =====
    doc.fontSize(20).font('Helvetica-Bold').text(company.name, leftColumn, currentY);
    currentY += 35;

    doc.fontSize(10).font('Helvetica')
       .text(company.address, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Phone: ${company.phone || "000-000-0000"}`, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Email: ${company.email || "contact@company.com"}`, leftColumn, currentY);
    currentY += 15;

    if (company.gst) {
      doc.text(`GST: ${company.gst}`, leftColumn, currentY);
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
    const addressLines = doc.heightOfString(customer.address, { width: columnWidth });
    doc.text(customer.address, leftColumn, currentY, { width: columnWidth });
    currentY += addressLines + 10;
    
    doc.text(`Phone: ${customer.phone}`, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Email: ${customer.email}`, leftColumn, currentY);
    
    // Reset currentY to the highest point for right column
    currentY = billToStartY;

    // ===== INVOICE DETAILS SECTION - RIGHT SIDE =====
    doc.fontSize(16).font('Helvetica-Bold').text("INVOICE", rightColumn, currentY);
    currentY += 40;

    // Invoice details in two columns
    const detailLabels = ["DATE:", "INVOICE NO:", "CUSTOMER ID:", "DUE DATE:"];
    const invDate = invoiceDate ? new Date(invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const due = dueDate ? new Date(dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const detailValues = [
      invDate,
      invoice._id.toString().slice(-6).toUpperCase(),
      customerId.toString().slice(-3).toUpperCase(),
      due
    ];

    detailLabels.forEach((label, index) => {
      doc.fontSize(10).font('Helvetica-Bold')
         .text(label, rightColumn, currentY);
      doc.font('Helvetica')
         .text(detailValues[index], rightColumn + 80, currentY);
      currentY += 15;
    });

    // ===== ITEMS TABLE =====
    // Find the maximum Y position between left and right columns
    const leftColumnBottom = billToStartY + 120; // Approximate bottom of Bill To section
    currentY = Math.max(currentY, leftColumnBottom) + 40;

    // Table headers
    doc.rect(leftColumn, currentY, pageWidth - leftColumn, 20).fill("#f0f0f0");
    doc.fontSize(10).font('Helvetica-Bold').fillColor("#000")
       .text("DESCRIPTION", leftColumn + 10, currentY + 5)
       .text("AMOUNT", pageWidth - 60, currentY + 5, { align: "right" });

    currentY += 25;

    // Table rows
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
        width: 350,
        align: 'left'
      });
      
      doc.fontSize(10).font('Helvetica')
         .text(item.description, leftColumn + 10, currentY, {
           width: 350,
           align: 'left'
         })
         .text(`$${Number(item.amount).toFixed(2)}`, pageWidth - 100, currentY, { 
           align: "right" 
         });
      
      currentY += Math.max(descriptionHeight, 20) + 5;
    });

    // ===== TOTALS SECTION =====
    currentY += 10;
    
    // Subtotal
    doc.fontSize(10).font('Helvetica')
       .text("Subtotal:", pageWidth - 150, currentY, { align: "left" })
       .text(`$${subtotal.toFixed(2)}`, pageWidth - 100, currentY, { align: "right" });
    currentY += 20;
    
    // Tax
    if (taxPercent > 0) {
      doc.text(`Tax (${taxPercent}%):`, pageWidth - 150, currentY, { align: "left" })
         .text(`$${taxAmount.toFixed(2)}`, pageWidth - 100, currentY, { align: "right" });
      currentY += 20;
    }
    
    // Total
    doc.moveTo(pageWidth - 200, currentY).lineTo(pageWidth, currentY).stroke();
    currentY += 15;
    
    doc.fontSize(12).font('Helvetica-Bold')
       .text("TOTAL:", pageWidth - 150, currentY, { align: "left" })
       .text(`$${grandTotal.toFixed(2)}`, pageWidth - 100, currentY, { align: "right" });
    currentY += 30;

    // ===== AMOUNT IN WORDS =====
    const amountWords = toWords(Math.round(grandTotal)) + " dollars only";
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
    const contactInfo = `${company.name}, ${company.phone}, ${company.email}`;
    
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

// Download existing invoice
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
        name: "Zynith IT Solutions",
        address: "123 Business Street, City, ST 12345",
        email: "admin@zynith-it.com",
        phone: "000-000-0000",
        gst: "GSTIN123456789"
      };
    }

    // Use the same PDF generation logic from generateInvoice function
    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 50,
      bufferPages: true 
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice._id}.pdf`);
    doc.pipe(res);

    // ===== DYNAMIC POSITIONING VARIABLES =====
    let currentY = 50;
    const leftColumn = 50;
    const rightColumn = 350;
    const pageWidth = 550;
    const columnWidth = 200;

    // ===== HEADER SECTION =====
    doc.fontSize(20).font('Helvetica-Bold').text(company.name, leftColumn, currentY);
    currentY += 35;

    doc.fontSize(10).font('Helvetica')
       .text(company.address, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Phone: ${company.phone || "000-000-0000"}`, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Email: ${company.email || "contact@company.com"}`, leftColumn, currentY);
    currentY += 15;

    if (company.gst) {
      doc.text(`GST: ${company.gst}`, leftColumn, currentY);
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
    const addressLines = doc.heightOfString(invoice.customerId.address, { width: columnWidth });
    doc.text(invoice.customerId.address, leftColumn, currentY, { width: columnWidth });
    currentY += addressLines + 10;
    
    doc.text(`Phone: ${invoice.customerId.phone}`, leftColumn, currentY);
    currentY += 15;
    
    doc.text(`Email: ${invoice.customerId.email}`, leftColumn, currentY);
    
    // Reset currentY to the highest point for right column
    currentY = billToStartY;

    // ===== INVOICE DETAILS SECTION - RIGHT SIDE =====
    doc.fontSize(16).font('Helvetica-Bold').text("INVOICE", rightColumn, currentY);
    currentY += 40;

    // Invoice details in two columns
    const detailLabels = ["DATE:", "INVOICE NO:", "CUSTOMER ID:", "DUE DATE:"];
    const invDate = new Date(invoice.date).toISOString().split('T')[0];
    const due = invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : 'N/A';
    const detailValues = [
      invDate,
      invoice._id.toString().slice(-6).toUpperCase(),
      invoice.customerId._id.toString().slice(-3).toUpperCase(),
      due
    ];

    detailLabels.forEach((label, index) => {
      doc.fontSize(10).font('Helvetica-Bold')
         .text(label, rightColumn, currentY);
      doc.font('Helvetica')
         .text(detailValues[index], rightColumn + 80, currentY);
      currentY += 15;
    });

    // ===== ITEMS TABLE =====
    const leftColumnBottom = billToStartY + 120;
    currentY = Math.max(currentY, leftColumnBottom) + 40;

    // Table headers
    doc.rect(leftColumn, currentY, pageWidth - leftColumn, 20).fill("#f0f0f0");
    doc.fontSize(10).font('Helvetica-Bold').fillColor("#000")
       .text("DESCRIPTION", leftColumn + 10, currentY + 5)
       .text("AMOUNT", pageWidth - 60, currentY + 5, { align: "right" });

    currentY += 25;

    // Table rows
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
        width: 350,
        align: 'left'
      });
      
      doc.fontSize(10).font('Helvetica')
         .text(item.description, leftColumn + 10, currentY, {
           width: 350,
           align: 'left'
         })
         .text(`$${Number(item.amount).toFixed(2)}`, pageWidth - 100, currentY, { 
           align: "right" 
         });
      
      currentY += Math.max(descriptionHeight, 20) + 5;
    });

    // ===== TOTALS SECTION =====
    currentY += 10;
    
    // Subtotal
    doc.fontSize(10).font('Helvetica')
       .text("Subtotal:", pageWidth - 150, currentY, { align: "left" })
       .text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - 100, currentY, { align: "right" });
    currentY += 20;
    
    // Tax
    if (invoice.taxPercent > 0) {
      doc.text(`Tax (${invoice.taxPercent}%):`, pageWidth - 150, currentY, { align: "left" })
         .text(`$${invoice.taxAmount.toFixed(2)}`, pageWidth - 100, currentY, { align: "right" });
      currentY += 20;
    }
    
    // Total
    doc.moveTo(pageWidth - 200, currentY).lineTo(pageWidth, currentY).stroke();
    currentY += 15;
    
    doc.fontSize(12).font('Helvetica-Bold')
       .text("TOTAL:", pageWidth - 150, currentY, { align: "left" })
       .text(`$${invoice.totalAmount.toFixed(2)}`, pageWidth - 100, currentY, { align: "right" });
    currentY += 30;

    // ===== AMOUNT IN WORDS =====
    const amountWords = toWords(Math.round(invoice.totalAmount)) + " dollars only";
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