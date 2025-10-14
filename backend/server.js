import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
//import reportRoutes from "./routes/reportRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import transactionRoutes from "./routes/transactions.js"; // Fixed import name
import companyRoutes from "./routes/companyRoutes.js"

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Routes
//app.use("/api/reports", reportRoutes);
app.use("/api/billing", billingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/company', companyRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
