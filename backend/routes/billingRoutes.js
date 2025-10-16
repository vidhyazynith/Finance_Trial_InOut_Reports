import express from "express";
import multer from "multer";
import { 
  generateInvoice, 
  getCustomers, 
  addCustomer, 
  getCustomerById,
  getInvoices,
  getInvoiceById,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  verifyPayment, 
  deleteInvoice ,
  downloadInvoice,
  getPaymentProof,
  getInvoicePaymentProof
} from "../controllers/billingController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Customer routes
router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomerById);
router.post("/add-customer", addCustomer);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);
router.patch("/customers/:id", updateCustomerStatus);


// Invoice routes
router.post("/generate-invoice", generateInvoice);
router.get("/invoices", getInvoices);
router.get("/invoices/:id", getInvoiceById);
router.get("/invoices/:id/download", downloadInvoice); // Add this route
router.delete("/invoices/:id", deleteInvoice); // ADD DELETE INVOICE ROUTE
router.post("/verify-payment", upload.single('transactionProof'), verifyPayment); // ADD VERIFY PAYMENT ROUTE
router.get('/payment-proofs/:filename', getPaymentProof);
router.get('/invoices/:id/payment-proof', getInvoicePaymentProof);

export default router;
