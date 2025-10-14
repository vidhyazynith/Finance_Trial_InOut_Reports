import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  email: String,
  phone: String,
  gst: String,
  bankDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    ifsc: String,
    upiId: String,
  },
});

export default mongoose.model("Company", companySchema);
