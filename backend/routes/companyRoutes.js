// backend/routes/companyRoutes.js
import express from "express";
import Company from "../models/Company.js";

const router = express.Router();

/* ==========================
   GET Company Info
========================== */
router.get("/", async (req, res) => {
  try {
    const company = await Company.findOne();
    if (!company) {
      return res.json({
        success: true,
        message: "No company info found",
        data: {},
      });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching company information",
      error: error.message,
    });
  }
});

/* ==========================
   PUT Company Info (Update or Create)
========================== */
router.put("/", async (req, res) => {
  try {
    const {
      companyName,
      address,
      phone,
      email,
      taxId,
      currency,
      fiscalYear,
    } = req.body;

    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "Company address is required" });
    }

    let company = await Company.findOne();

    if (company) {
      company.companyName = companyName || company.companyName;
      company.address = address;
      company.phone = phone;
      company.email = email;
      company.taxId = taxId;
      company.currency = currency;
      company.fiscalYear = fiscalYear;
      await company.save();
    } else {
      company = await Company.create({
        companyName,
        address,
        phone,
        email,
        taxId,
        currency,
        fiscalYear,
      });
    }

    res.json({
      success: true,
      message: "Company information updated successfully",
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating company information",
      error: error.message,
    });
  }
});

export default router;
