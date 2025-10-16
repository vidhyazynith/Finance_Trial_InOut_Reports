import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';

const ReportsBilling = () => {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([{ description: "", remarks: "", amount: "" }]);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showItemsTable, setShowItemsTable] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [transactionNumber, setTransactionNumber] = useState('');
  const [transactionProof, setTransactionProof] = useState(null);

  // Currency symbols mapping
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    INR: '₹'
  };

  // Load customers and invoices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersRes = await axios.get("http://localhost:5000/api/billing/customers");
        setCustomers(customersRes.data);

        const invoicesRes = await axios.get("http://localhost:5000/api/billing/invoices");
        setInvoices(invoicesRes.data);

        // Set default dates
        const today = new Date().toISOString().split("T")[0];
        setInvoiceDate(today);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching data");
      }
    };

    fetchData();
  }, []);

  // Handle invoice download
  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/billing/invoices/${invoiceId}/download`,
        { responseType: "blob" }
      );

      // Download PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Error downloading invoice. Please try again.");
    }
  };

  // Function to view payment proof
  const handleViewPaymentProof = async (invoice) => {
    if (!invoice.paymentDetails?.proofFile?.fileUrl) {
      alert('No payment proof available');
      return;
    }

    try {
      // Construct the full URL to the payment proof
      const proofUrl = `http://localhost:5000${invoice.paymentDetails.proofFile.fileUrl}`;
      
      // Open the payment proof in a new tab
      window.open(proofUrl, '_blank');
    } catch (error) {
      console.error('Error viewing payment proof:', error);
      alert('Error viewing payment proof');
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`http://localhost:5000/api/billing/invoices/${invoiceId}`);
        // Remove from local state
        setInvoices(invoices.filter(invoice => invoice._id !== invoiceId));
        alert('Invoice deleted successfully');
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Error deleting invoice. Please try again.");
      }
    }
  };

  // Open payment verification modal
  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  // Close payment verification modal
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setTransactionNumber('');
    setTransactionProof(null);
  };

  // Handle file upload for transaction proof
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Maximum size is 10MB.');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Supported formats: PDF, JPG, PNG, DOC');
        return;
      }
      
      setTransactionProof(file);
    }
  };

  // Handle payment verification
  // Handle payment verification
const handleVerifyPayment = async () => {
  if (!transactionNumber.trim()) {
    alert('Please enter a transaction number');
    return;
  }

  if (!transactionProof) {
    alert('Please upload proof of transaction');
    return;
  }

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('invoiceId', selectedInvoice._id);
    formData.append('transactionNumber', transactionNumber);
    formData.append('transactionProof', transactionProof);

    const response = await axios.post('http://localhost:5000/api/billing/verify-payment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Update invoice with complete data including payment details
    setInvoices(invoices.map(inv => 
      inv._id === selectedInvoice._id 
        ? response.data.invoice // Use the complete invoice data from response
        : inv
    ));

    alert('Payment verified successfully!');
    closePaymentModal();
  } catch (error) {
    console.error('Error verifying payment:', error);
    alert('Error verifying payment. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // Add / Remove / Edit items
  const handleAddItem = () => {
    setItems([...items, { description: "", remarks: "", amount: "" }]);
    setShowItemsTable(true);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    if (newItems.length === 0) {
      setShowItemsTable(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Format currency display based on selected currency
  const formatCurrencyDisplay = (amount) => {
    if (currency === 'INR') {
      // Indian numbering system
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } else {
      // Western numbering system
      return amount.toFixed(2);
    }
  };

  // Total calculation
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const taxAmount = subtotal * (taxPercent / 100);
    const total = subtotal + taxAmount;

    return {
      subtotal: subtotal,
      taxAmount: taxAmount,
      total: total,
      formattedSubtotal: formatCurrencyDisplay(subtotal),
      formattedTaxAmount: formatCurrencyDisplay(taxAmount),
      formattedTotal: formatCurrencyDisplay(total)
    };
  };

  const totals = calculateTotal();

  // Function to check invoice status
  const checkInvoiceStatus = (invoice) => {
    const today = new Date();
    const due = new Date(invoice.dueDate);
    const invoiceDate = new Date(invoice.date);
    
    if (invoice.status === 'paid') return 'paid';
    
    if (invoice.dueDate && today > due) return 'overdue';
    
    return invoice.status === 'sent' ? 'unpaid' : invoice.status;
  };

  // Format invoice amount display
  const formatInvoiceAmount = (invoice) => {
    const amount = invoice.totalAmount || 0;
    if (invoice.currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } else {
      return amount.toFixed(2);
    }
  };

  // Open invoice modal
  const openInvoiceModal = () => {
    setShowInvoiceModal(true);
  };

  // Close invoice modal and reset form
  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setItems([{ description: "", remarks: "", amount: "" }]);
    setSelectedCustomer('');
    setNotes("");
    setTaxPercent(0);
    setCurrency('USD');
    setShowItemsTable(false);
  };

  // Invoice generation
  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer.");
      return;
    }

    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }

    const invalidItems = items.some((item) => !item.description.trim() || !item.amount || item.amount <= 0);
    if (invalidItems) {
      alert("Please enter valid item descriptions and amounts.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/billing/generate-invoice",
        {
          customerId: selectedCustomer,
          items: items.map((item) => ({
            description: item.description,
            remarks: item.remarks,
            amount: Number(item.amount),
          })),
          totalAmount: totals.total,
          invoiceDate,
          dueDate,
          taxPercent: Number(taxPercent),
          notes,
          currency: currency,
        },
        { responseType: "blob" }
      );

      // Download PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert("Invoice generated successfully!");
      
      // Refresh invoices list
      const invoicesRes = await axios.get("http://localhost:5000/api/billing/invoices");
      setInvoices(invoicesRes.data);
      
      // Close modal and reset form
      closeInvoiceModal();
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Error generating invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get all invoices sorted by date (newest first)
  const getAllInvoices = () => {
    return invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className="reports-billing-container">
      {/* Header with Generate Invoice Button */}
      <div className="reports-header">
        <div className="header-content">
          <div className="header-text">
            
          </div>
          <button className="generate-invoice-main-btn" onClick={openInvoiceModal}>
            Generate New Invoice
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Profit & Loss Report */}
          <div className="report-card">
            <div className="card-header">
              <h3>Profit & Loss Report</h3>
              <p>Comprehensive financial performance overview</p>
            </div>
            
            <div className="form-section">
              <div className="form-field">
                <label>Date Range</label>
                <div className="date-range">
                  <input type="date" className="date-input" />
                  <span>to</span>
                  <input type="date" className="date-input" />
                </div>
              </div>
              
              <div className="export-buttons">
                <button className="export-btn pdf">PDF</button>
                <button className="export-btn excel">Excel</button>
              </div>
            </div>
          </div>

          {/* Invoice History */}
          <div className="report-card invoice-history-card">
            <div className="card-header">
              <h3>Invoice History</h3>
              <p>All generated invoices</p>
            </div>
            
            <div className="invoice-history-table">
              <table>
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getAllInvoices().map(invoice => {
                    const status = checkInvoiceStatus(invoice);
                    return (
                      <tr key={invoice._id}>
                        <td className="invoice-number">{invoice.invoiceNumber || `INV-${invoice._id.toString().slice(-6).toUpperCase()}`}</td>
                        <td className="customer-info">
                          <div className="customer-name">{invoice.customerId?.name || 'N/A'}</div>
                          <div className="customer-id">{invoice.customerId?.customerId || ''}</div>
                        </td>
                        <td>{new Date(invoice.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${status}`}>
                            {status === 'overdue' ? 'Overdue' : 
                             status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="amount">
                          {currencySymbols[invoice.currency] || '$'}{formatInvoiceAmount(invoice)}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn download" 
                              onClick={() => handleDownloadInvoice(invoice._id)}
                              title="Download Invoice"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </button>
                            
                            {/* View Payment Proof Button - Only for paid invoices with proof */}
                            {invoice.status === 'paid' && invoice.paymentDetails?.proofFile && (
                              <button 
                                className="action-btn view-proof"
                                onClick={() => handleViewPaymentProof(invoice)}
                                title="View Payment Proof"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </button>
                            )}
                            
                            {/* Verify Payment Button - Only for unpaid/overdue invoices */}
                            {(status === 'unpaid' || status === 'overdue') && (
                              <button 
                                className="action-btn verify-payment"
                                onClick={() => openPaymentModal(invoice)}
                                title="Verify Payment"
                              >
                                Verify Payment
                              </button>
                            )}
                            
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDeleteInvoice(invoice._id)}
                              title="Delete Invoice"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {getAllInvoices().length === 0 && (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', color: '#666'}}>
                        No invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Generation Modal */}
      {showInvoiceModal && (
        <div className="modal-overlay" onClick={closeInvoiceModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generate New Invoice</h2>
              <button className="close-modal-btn" onClick={closeInvoiceModal}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="report-card invoice-generation-card">
                <div className="card-header">
                  <h3>Invoice Details</h3>
                  <p>Create and manage customer invoices</p>
                </div>
                
                <div className="form-section">
                  <div className="form-field">
                    <label className="required">Select Customer</label>
                    <select 
                      className="form-select" 
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      required
                    >
                      <option value="">-- Select Customer --</option>
                      {customers.map(customer => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name} {customer.company ? `- ${customer.company}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Invoice Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-field">
                      <label className="required">Due Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Currency</label>
                    <select 
                      className="form-select" 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="INR">Indian Rupee (₹)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Tax (%)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(e.target.value)}
                      placeholder="e.g. 10"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  
                  {/* Items Section */}
                  <div className="invoice-items-section">
                    <div className="section-header">
                      <label className="required">Invoice Items</label>
                      <button onClick={handleAddItem} className="add-item-btn">
                        + Add Item
                      </button>
                    </div>
                    
                    {showItemsTable && (
                      <div className="invoice-items-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th>Remarks</th>
                              <th>Amount ({currencySymbols[currency]})</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    type="text"
                                    placeholder="Item description"
                                    value={item.description}
                                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                    className="table-input"
                                    required
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    placeholder="Additional remarks"
                                    value={item.remarks}
                                    onChange={(e) => handleItemChange(index, "remarks", e.target.value)}
                                    className="table-input remarks-input"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={item.amount}
                                    onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                                    className="table-input"
                                    min="0"
                                    step="0.01"
                                    required
                                  />
                                </td>
                                <td>
                                  {items.length > 1 && (
                                    <button 
                                      className="remove-btn"
                                      onClick={() => handleRemoveItem(index)}
                                    >
                                      Remove
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Totals Summary */}
                  {showItemsTable && (
                    <div className="totals-summary">
                      <div className="summary-line">
                        <span>Subtotal:</span>
                        <span>{currencySymbols[currency]}{totals.formattedSubtotal}</span>
                      </div>
                      {taxPercent > 0 && (
                        <div className="summary-line">
                          <span>Tax ({taxPercent}%):</span>
                          <span>{currencySymbols[currency]}{totals.formattedTaxAmount}</span>
                        </div>
                      )}
                      <div className="summary-total">
                        <span>Grand Total:</span>
                        <span>{currencySymbols[currency]}{totals.formattedTotal}</span>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="form-field">
                    <label>Additional Notes</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Any additional notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                    />
                  </div>
                  
                  <button 
                    className="generate-invoice-btn" 
                    onClick={handleGenerateInvoice}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate & Download PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Verification Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="report-card payment-details-card">
                <div className="card-header">
                  <h3>Payment Details</h3>
                </div>
                
                <div className="form-section">
                  <div className="invoice-summary">
                    <div className="summary-row">
                      <span>Customer:</span>
                      <span>{selectedInvoice.customerId?.name || 'N/A'}</span>
                    </div>
                    <div className="summary-row">
                      <span>Amount Due:</span>
                      <span className="amount-due">
                        {currencySymbols[selectedInvoice.currency] || '$'}{formatInvoiceAmount(selectedInvoice)}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span>Due Date:</span>
                      <span>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <label>Transaction Number *</label>
                    <input 
                      type="text"
                      className="form-input"
                      value={transactionNumber}
                      onChange={(e) => setTransactionNumber(e.target.value)}
                      placeholder="Enter transaction/reference number"
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Proof of Transaction *</label>
                    <div className="file-upload-container">
                      <input 
                        type="file"
                        id="transaction-proof"
                        className="file-input"
                        onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        required
                      />
                      <label htmlFor="transaction-proof" className="file-upload-label">
                        {transactionProof ? transactionProof.name : 'Choose file...'}
                      </label>
                      {transactionProof && (
                        <span className="file-size">
                          {(transactionProof.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                    <p className="file-hint">Supported formats: PDF, JPG, PNG, DOC (Max: 10MB)</p>
                  </div>
                  
                  <div className="payment-actions">
                    <button className="cancel-btn" onClick={closePaymentModal}>
                      Cancel
                    </button>
                    <button 
                      className="confirm-payment-btn" 
                      onClick={handleVerifyPayment}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Confirm Payment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsBilling;