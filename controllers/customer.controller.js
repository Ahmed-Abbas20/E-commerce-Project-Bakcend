const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../repos/customer.repo");
const { AppError } = require("../utils/errorHandler");




// ✅ Get all customers
router.get("/", async (req, res, next) => {
  try {
    const customers = await getAllCustomers();
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Get a customer by ID
router.get("/:customerId", async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const customer = await getCustomerById(customerId);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});




// ✅ Update a customer
router.put("/:customerId", async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedCustomer = await updateCustomer(customerId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedCustomer });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});


// ✅ Delete a customer
router.delete("/:customerId", async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const deletedCustomer = await deleteCustomer(customerId);
    res.status(200).json({ success: true, data: deletedCustomer });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = router;
