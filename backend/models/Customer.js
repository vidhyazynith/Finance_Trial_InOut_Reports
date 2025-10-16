import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customerId: { type: String, unique: true }, // Auto-incremented customer ID
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  company: { type: String, default: "" },
  customerType: {
    type: String,
    enum: ["individual", "corporate"],
    default: "individual"
  },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
});

// Auto-increment customerId
customerSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastCustomer = await this.constructor.findOne().sort({ customerId: -1 });
    if (lastCustomer && lastCustomer.customerId) {
      const lastId = parseInt(lastCustomer.customerId.replace('CUST', '')) || 0;
      this.customerId = 'CUST' + String(lastId + 1).padStart(5, '0');
    } else {
      this.customerId = 'CUST00001';
    }
  }
  next();
});

export default mongoose.model("Customer", customerSchema);