// import mongoose from "mongoose";

// const customerSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   address: { type: String, required: true },
// });

// export default mongoose.model("Customer", customerSchema);

import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },         // Customer name
  email: { type: String, required: true },        // Email address
  phone: { type: String, required: true },        // Contact number
  address: { type: String, required: true },      // Address
  company: { type: String, default: "" },         // Optional company name
  customerType: {                                 // Individual or Corporate
    type: String,
    enum: ["individual", "corporate"],
    default: "individual"
  },
  joinDate: { type: Date, default: Date.now },    // Auto timestamp when added
  status: { type: String, enum: ["active", "inactive"], default: "active" } // optional status
});

export default mongoose.model("Customer", customerSchema);
