// import mongoose from "mongoose";

// const invoiceSchema = new mongoose.Schema({
//   customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
//   items: [{ description: String, amount: Number }],
//   totalAmount: Number,
//   date: { type: Date, default: Date.now },
// });

// export default mongoose.model("Invoice", invoiceSchema);

import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Customer", 
    required: true 
  },
  items: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  taxPercent: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  dueDate: { type: Date },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ["sent", "paid", "overdue"], 
    default: "draft" 
  }
}, {
  timestamps: true
});

export default mongoose.model("Invoice", invoiceSchema);

// import mongoose from "mongoose";

// const itemSchema = new mongoose.Schema({
//   description: String,
//   unitPrice: Number,
//   quantity: Number,
//   taxed: Boolean,
//   amount: Number,
// });

// const invoiceSchema = new mongoose.Schema({
//   customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
//   items: [itemSchema],
//   subtotal: Number,
//   taxRate: Number,
//   taxAmount: Number,
//   total: Number,
//   invoiceNumber: String,
//   date: { type: Date, default: Date.now },
//   dueDate: Date,
// });

// export default mongoose.model("Invoice", invoiceSchema);
