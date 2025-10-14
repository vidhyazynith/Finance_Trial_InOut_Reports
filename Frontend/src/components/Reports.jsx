// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './Reports.css';

// const ReportsBilling = () => {
//   const [customers, setCustomers] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState('');
//   const [items, setItems] = useState([{ description: "", amount: "" }]);
//   const [invoiceDate, setInvoiceDate] = useState('');
//   const [dueDate, setDueDate] = useState('');
//   const [taxPercent, setTaxPercent] = useState(0);
//   const [notes, setNotes] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showItemsTable, setShowItemsTable] = useState(false);

//   // Load customers and invoices
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const customersRes = await axios.get("http://localhost:5000/api/billing/customers");
//         setCustomers(customersRes.data);

//         const invoicesRes = await axios.get("http://localhost:5000/api/billing/invoices");
//         setInvoices(invoicesRes.data);

//         // Set default dates
//         const today = new Date().toISOString().split("T")[0];
//         setInvoiceDate(today);
//         // setDueDate(due);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         alert("Error fetching data");
//       }
//     };

//     fetchData();
//   }, []);

//   // Add this function to handle invoice download
//   const handleDownloadInvoice = async (invoiceId) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:5000/api/billing/invoices/${invoiceId}/download`,
//         { responseType: "blob" }
//       );

//       // Download PDF
//       const blob = new Blob([response.data], { type: "application/pdf" });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `Invoice-${invoiceId}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       console.error("Error downloading invoice:", error);
//       alert("Error downloading invoice. Please try again.");
//     }
//   };


//   // Add / Remove / Edit items
//   const handleAddItem = () => {
//     setItems([...items, { description: "", amount: "" }]);
//     setShowItemsTable(true);
//   };

//   const handleRemoveItem = (index) => {
//     const newItems = items.filter((_, i) => i !== index);
//     setItems(newItems);
//     if (newItems.length === 0) {
//       setShowItemsTable(false);
//     }
//   };

//   const handleItemChange = (index, field, value) => {
//     const newItems = [...items];
//     newItems[index][field] = value;
//     setItems(newItems);
//   };

//   // Total calculation
//   const calculateTotal = () => {
//     const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
//     const taxAmount = subtotal * (taxPercent / 100);
//     const total = subtotal + taxAmount;

//     return {
//       subtotal: subtotal.toFixed(2),
//       taxAmount: taxAmount.toFixed(2),
//       total: total.toFixed(2),
//     };
//   };

//   const totals = calculateTotal();

//   // Function to check invoice status
//   const checkInvoiceStatus = (invoice) => {
//     const today = new Date();
//     const due = new Date(invoice.dueDate);
//     const invoiceDate = new Date(invoice.date);
    
//     if (invoice.status === 'paid') return 'paid';
//     if (invoice.dueDate && today > due) return 'overdue';
//     return invoice.status === 'sent' ? 'unpaid' : invoice.status;
//   };

//   // Invoice generation
//   const handleGenerateInvoice = async () => {
//     if (!selectedCustomer) {
//       alert("Please select a customer.");
//       return;
//     }

//     const invalidItems = items.some((item) => !item.description.trim() || !item.amount || item.amount <= 0);
//     if (invalidItems) {
//       alert("Please enter valid item descriptions and amounts.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/billing/generate-invoice",
//         {
//           customerId: selectedCustomer,
//           items: items.map((item) => ({
//             description: item.description,
//             amount: Number(item.amount),
//           })),
//           totalAmount: totals.total,
//           invoiceDate,
//           dueDate,
//           taxPercent: Number(taxPercent),
//           notes,
//         },
//         { responseType: "blob" }
//       );

//       // Download PDF
//       const blob = new Blob([response.data], { type: "application/pdf" });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `Invoice-${new Date().toISOString().split("T")[0]}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       alert("Invoice generated successfully!");
      
//       // Refresh invoices list
//       const invoicesRes = await axios.get("http://localhost:5000/api/billing/invoices");
//       setInvoices(invoicesRes.data);
      
//       // Reset form
//       setItems([{ description: "", amount: "" }]);
//       setSelectedCustomer('');
//       setNotes("");
//       setTaxPercent(0);
//       setShowItemsTable(false);
//     } catch (error) {
//       console.error("Error generating invoice:", error);
//       alert("Error generating invoice. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getRecentInvoices = () => {
//     return invoices.slice(0, 5).sort((a, b) => new Date(b.date) - new Date(a.date));
//   };

//   return (
//     <div className="reports-billing-container">
//       {/* Header */}
//       <div className="reports-header">
//         <h1>Reports & Billing</h1>
//         <p>Welcome back, Admin</p>
//         <p className="subtitle">Generate financial reports and create invoices</p>
//       </div>

//       {/* Main Content Grid */}
//       <div className="main-content-grid">
//         {/* Left Column */}
//         <div className="left-column">
//           {/* Profit & Loss Report */}
//           <div className="report-card">
//             <div className="card-header">
//               <h3>Profit & Loss Report</h3>
//               <p>Comprehensive financial performance overview</p>
//             </div>
            
//             <div className="form-section">
//               <div className="form-field">
//                 <label>Date Range</label>
//                 <div className="date-range">
//                   <input type="date" className="date-input" />
//                   <span>to</span>
//                   <input type="date" className="date-input" />
//                 </div>
//               </div>
              
//               <div className="export-buttons">
//                 <button className="export-btn pdf">PDF</button>
//                 <button className="export-btn excel">Excel</button>
//               </div>
//             </div>
//           </div>

//           {/* Recent Invoices */}
//           <div className="report-card recent-invoices-card">
//             <div className="card-header">
//               <h3>Recent Invoices</h3>
//               <p>Latest generated invoices</p>
//             </div>
            
//             <div className="recent-invoices-table">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Invoice Number</th>
//                     <th>Customer</th>
//                     <th>Date</th>
//                     <th>Status</th>
//                     <th>Amount</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {getRecentInvoices().map(invoice => (
//                     <tr key={invoice._id}>
//                       <td className="invoice-number">INV-{invoice._id.toString().slice(-6).toUpperCase()}</td>
//                       <td className="customer-info">
//                         <div className="customer-name">{invoice.customerId?.name || 'N/A'}</div>
//                         <div className="customer-id">{invoice.customerId?.email || ''}</div>
//                       </td>
//                       <td>{new Date(invoice.date).toLocaleDateString()}</td>
//                       <td>
//                         <span className={`status-badge ${checkInvoiceStatus(invoice)}`}>
//                           {checkInvoiceStatus(invoice) === 'overdue' ? 'Overdue' : 
//                            checkInvoiceStatus(invoice) === 'paid' ? 'Paid' : 'Unpaid'}
//                         </span>
//                       </td>
//                       <td className="amount">${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
//                       <td>
//                         <button className="action-btn download">↓</button>
//                       </td>
//                     </tr>
//                   ))}
//                   {getRecentInvoices().length === 0 && (
//                     <tr>
//                       <td colSpan="6" style={{textAlign: 'center', color: '#666'}}>
//                         No invoices found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Only Invoice Generation */}
//         <div className="right-column">
//           {/* Invoice Generation */}
//           <div className="report-card invoice-generation-card">
//             <div className="card-header">
//               <h3>Invoice Generation</h3>
//               <p>Create and manage customer invoices</p>
//             </div>
            
//             <div className="form-section">
//               <div className="form-field">
//                 <label>Select Customer *</label>
//                 <select 
//                   className="form-select" 
//                   value={selectedCustomer}
//                   onChange={(e) => setSelectedCustomer(e.target.value)}
//                 >
//                   <option value="">-- Select Customer --</option>
//                   {customers.map(customer => (
//                     <option key={customer._id} value={customer._id}>
//                       {customer.name} {customer.company ? `- ${customer.company}` : ""}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="form-grid-2">
//                 <div className="form-field">
//                   <label>Invoice Date</label>
//                   <input 
//                     type="date" 
//                     className="form-input"
//                     value={invoiceDate}
//                     onChange={(e) => setInvoiceDate(e.target.value)}
//                   />
//                 </div>
                
//                 <div className="form-field">
//                   <label>Due Date *</label>
//                   <input 
//                     type="date" 
//                     className="form-input"
//                     value={dueDate}
//                     onChange={(e) => setDueDate(e.target.value)}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label>Tax (%)</label>
//                 <input 
//                   type="number" 
//                   className="form-input"
//                   value={taxPercent}
//                   onChange={(e) => setTaxPercent(e.target.value)}
//                   placeholder="e.g. 10"
//                   min="0"
//                   max="100"
//                 />
//               </div>
              
//               {/* Items Section */}
//               <div className="invoice-items-section">
//                 <div className="section-header">
//                   <label>Invoice Items *</label>
//                   <button onClick={handleAddItem} className="add-item-btn">
//                     + Add Item
//                   </button>
//                 </div>
                
//                 {showItemsTable && (
//                   <div className="invoice-items-table">
//                     <table>
//                       <thead>
//                         <tr>
//                           <th>Description</th>
//                           <th>Amount ($)</th>
//                           <th>Action</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {items.map((item, index) => (
//                           <tr key={index}>
//                             <td>
//                               <input
//                                 type="text"
//                                 placeholder="Item description"
//                                 value={item.description}
//                                 onChange={(e) => handleItemChange(index, "description", e.target.value)}
//                                 className="table-input"
//                               />
//                             </td>
//                             <td>
//                               <input
//                                 type="number"
//                                 placeholder="Amount"
//                                 value={item.amount}
//                                 onChange={(e) => handleItemChange(index, "amount", e.target.value)}
//                                 className="table-input"
//                                 min="0"
//                                 step="0.01"
//                               />
//                             </td>
//                             <td>
//                               {items.length > 1 && (
//                                 <button 
//                                   className="remove-btn"
//                                   onClick={() => handleRemoveItem(index)}
//                                 >
//                                   Remove
//                                 </button>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>

//               {/* Totals Summary */}
//               {showItemsTable && (
//                 <div className="totals-summary">
//                   <div className="summary-line">
//                     <span>Subtotal:</span>
//                     <span>${totals.subtotal}</span>
//                   </div>
//                   {taxPercent > 0 && (
//                     <div className="summary-line">
//                       <span>Tax ({taxPercent}%):</span>
//                       <span>${totals.taxAmount}</span>
//                     </div>
//                   )}
//                   <div className="summary-total">
//                     <span>Grand Total:</span>
//                     <span>${totals.total}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Notes */}
//               <div className="form-field">
//                 <label>Additional Notes</label>
//                 <textarea
//                   className="form-textarea"
//                   placeholder="Any additional notes..."
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   rows="3"
//                 />
//               </div>
              
//               <button 
//                 className="generate-invoice-btn" 
//                 onClick={handleGenerateInvoice}
//                 disabled={loading}
//               >
//                 {loading ? "Generating..." : "Generate & Download PDF"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportsBilling;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';

const ReportsBilling = () => {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([{ description: "", amount: "" }]);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showItemsTable, setShowItemsTable] = useState(false);

  // Load customers and invoices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersRes = await axios.get("http://localhost:5000/api/billing/customers");
        setCustomers(customersRes.data);

        const invoicesRes = await axios.get("http://localhost:5000/api/billing/invoices");
        setInvoices(invoicesRes.data);

        // Set default dates - only invoice date to today, due date empty
        const today = new Date().toISOString().split("T")[0];
        setInvoiceDate(today);
        // Don't set dueDate - let user choose
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching data");
      }
    };

    fetchData();
  }, []);

  // Add this function to handle invoice download
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

  // Add / Remove / Edit items
  const handleAddItem = () => {
    setItems([...items, { description: "", amount: "" }]);
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

  // Total calculation
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const taxAmount = subtotal * (taxPercent / 100);
    const total = subtotal + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const totals = calculateTotal();

  // Function to check invoice status
  const checkInvoiceStatus = (invoice) => {
    const today = new Date();
    const due = new Date(invoice.dueDate);
    const invoiceDate = new Date(invoice.date);
    
    // Use the status from database if it's paid
    if (invoice.status === 'paid') return 'paid';
    
    // Check if due date exists and is overdue
    if (invoice.dueDate && today > due) return 'overdue';
    
    // Otherwise use the status from database
    return invoice.status === 'sent' ? 'unpaid' : invoice.status;
  };

  // Invoice generation
  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer.");
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
            amount: Number(item.amount),
          })),
          totalAmount: totals.total,
          invoiceDate,
          dueDate,
          taxPercent: Number(taxPercent),
          notes,
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
      
      // Reset form
      setItems([{ description: "", amount: "" }]);
      setSelectedCustomer('');
      setNotes("");
      setTaxPercent(0);
      setShowItemsTable(false);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Error generating invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRecentInvoices = () => {
    return invoices.slice(0, 5).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className="reports-billing-container">
      {/* Header */}
      {/* <div className="reports-header">
        
        
      </div> */}

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

          {/* Recent Invoices */}
          <div className="report-card recent-invoices-card">
            <div className="card-header">
              <h3>Recent Invoices</h3>
              <p>Latest generated invoices</p>
            </div>
            
            <div className="recent-invoices-table">
              <table>
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getRecentInvoices().map(invoice => (
                    <tr key={invoice._id}>
                      <td className="invoice-number">INV-{invoice._id.toString().slice(-6).toUpperCase()}</td>
                      <td className="customer-info">
                        <div className="customer-name">{invoice.customerId?.name || 'N/A'}</div>
                        <div className="customer-id">{invoice.customerId?.email || ''}</div>
                      </td>
                      <td>{new Date(invoice.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${checkInvoiceStatus(invoice)}`}>
                          {checkInvoiceStatus(invoice) === 'overdue' ? 'Overdue' : 
                           checkInvoiceStatus(invoice) === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="amount">${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td>
                        <button 
                          className="action-btn download" 
                          onClick={() => handleDownloadInvoice(invoice._id)}
                        >
                          ↓
                        </button>
                      </td>
                    </tr>
                  ))}
                  {getRecentInvoices().length === 0 && (
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

        {/* Right Column - Only Invoice Generation */}
        <div className="right-column">
          {/* Invoice Generation */}
          <div className="report-card invoice-generation-card">
            <div className="card-header">
              <h3>Invoice Generation</h3>
              <p>Create and manage customer invoices</p>
            </div>
            
            <div className="form-section">
              <div className="form-field">
                <label>Select Customer *</label>
                <select 
                  className="form-select" 
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
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
                  <label>Due Date *</label>
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
                <label>Tax (%)</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  placeholder="e.g. 10"
                  min="0"
                  max="100"
                />
              </div>
              
              {/* Items Section */}
              <div className="invoice-items-section">
                <div className="section-header">
                  <label>Invoice Items *</label>
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
                          <th>Amount ($)</th>
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
                    <span>${totals.subtotal}</span>
                  </div>
                  {taxPercent > 0 && (
                    <div className="summary-line">
                      <span>Tax ({taxPercent}%):</span>
                      <span>${totals.taxAmount}</span>
                    </div>
                  )}
                  <div className="summary-total">
                    <span>Grand Total:</span>
                    <span>${totals.total}</span>
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
  );
};

export default ReportsBilling;