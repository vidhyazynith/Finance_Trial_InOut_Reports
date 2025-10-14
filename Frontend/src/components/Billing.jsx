import React, { useState, useEffect } from "react";
import axios from "axios";

function Billing() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState([{ description: "", amount: "" }]);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Load customers + set default dates
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/billing/customers");
        setCustomers(res.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        alert("Error fetching customers");
      }
    };

    fetchCustomers();

    const today = new Date().toISOString().split("T")[0];
    const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setInvoiceDate(today);
    setDueDate(due);
  }, []);

  // Add / Remove / Edit items
  const handleAddItem = () => {
    setItems([...items, { description: "", amount: "" }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
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
      setItems([{ description: "", amount: "" }]);
      setNotes("");
      setTaxPercent(0);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Error generating invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-container">
      <h2 className="title">Invoice Generator</h2>

      {/* Customer Section */}
      <div className="form-section">
        <label>Select Customer *</label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">-- Select Customer --</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.name} {customer.company ? `- ${customer.company}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Items Section */}
      <div className="items-section">
        <div className="section-header">
          <h3>Invoice Items</h3>
          <button onClick={handleAddItem} className="add-btn">
            + Add Item
          </button>
        </div>
        {items.map((item, index) => (
          <div className="item-row" key={index}>
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleItemChange(index, "description", e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              value={item.amount}
              onChange={(e) => handleItemChange(index, "amount", e.target.value)}
            />
            {items.length > 1 && (
              <button
                className="remove-btn"
                onClick={() => handleRemoveItem(index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Invoice Details */}
      <div className="details-section">
        <h3>Invoice Details</h3>
        <div className="grid-3">
          <div>
            <label>Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div>
            <label>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label>Tax (%)</label>
            <input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              placeholder="e.g. 10"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="form-section">
        <label>Additional Notes</label>
        <textarea
          placeholder="Any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

     {/* Totals */}
<div className="summary-section">
  <h3>Invoice Summary</h3>
  <div className="summary-content">
    <div className="summary-line">
      <span className="summary-label">Subtotal:</span>
      <span className="summary-value">${totals.subtotal}</span>
    </div>
    {taxPercent > 0 && (
      <div className="summary-line">
        <span className="summary-label">Tax ({taxPercent}%):</span>
        <span className="summary-value">${totals.taxAmount}</span>
      </div>
    )}
    <div className="summary-total">
      <span className="summary-label">Grand Total:</span>
      <span className="summary-value">${totals.total}</span>
    </div>
  </div>
</div>
      {/* Generate Button */}
      <button
        className="generate-btn"
        onClick={handleGenerateInvoice}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate & Download PDF"}
      </button>
    </div>
  );
}

export default Billing;
