// import express from "express";
// import { generateInvoice, getCustomers, addCustomer } from "../controllers/billingController.js";

// const router = express.Router();

// router.post("/generate", generateInvoice);
// router.get("/customers", getCustomers);
// router.post("/add-customer", addCustomer);

// export default router;


// import express from "express";
// import { 
//   generateInvoice, 
//   getCustomers, 
//   addCustomer, 
//   getCustomerById,
//   getInvoices,
//   getInvoiceById 
// } from "../controllers/billingController.js";

// const router = express.Router();

// // Customer routes
// router.get("/customers", getCustomers);
// router.get("/customers/:id", getCustomerById);
// router.post("/add-customer", addCustomer); // Changed from "/add-customer"

// // Invoice routes
// router.post("/generate-invoice", generateInvoice); // Changed from "/generate"
// router.get("/invoices", getInvoices);
// router.get("/invoices/:id", getInvoiceById);

// export default router;

// import express from "express";
// import {
//   generateInvoice,
//   getInvoices,
//   getInvoiceById,
//   getCustomers,
//   getCustomerById,
//   addCustomer,
// } from "../controllers/billingController.js";

// const router = express.Router();

// /* ---------------------- CUSTOMER ROUTES ---------------------- */

// // Get all customers
// router.get("/customers", getCustomers);

// // Get a single customer by ID
// router.get("/customers/:id", getCustomerById);

// // Add a new customer
// router.post("/addcustomers", addCustomer);

// /* ---------------------- INVOICE ROUTES ---------------------- */

// // Generate a new invoice (PDF + DB entry)
// router.post("/invoices", generateInvoice);

// // Get all invoices
// router.get("/invoices", getInvoices);

// // Get a specific invoice (PDF download or JSON)
// router.get("/invoices/:id", getInvoiceById);

// export default router;

import express from "express";
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
  downloadInvoice // Add this import
} from "../controllers/billingController.js";

const router = express.Router();

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

export default router;
