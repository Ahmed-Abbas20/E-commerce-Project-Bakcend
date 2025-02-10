const express = require("express");
const router = express.Router();
const  checkPermission  = require("../middlewares/authorization.middleware");
const {
  getCashiers,
  createCashier,
  updateCashier,
  deleteCashier,
  getCashierByEmail,
} = require("../repos/cashier.repo");

// Get all cashiers
router.get("/", checkPermission("cashier", "read"), async (req, res, next) => {
  try {
    const cashiers = await getCashiers();
    res.status(200).json({ success: true, data: cashiers });
  } catch (error) {
    next(error);
  }
});

// Create a new cashier
router.post("/", checkPermission("cashier", "create"), async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, managerId, SSN } = req.body;
    const claims = await createCashier({ firstName, lastName, email, password, phone1, managerId, SSN });
    res.status(201).json({ success: true, claims });
  } catch (error) {
    next(error);
  }
});

// Update a cashier
router.put("/:cashierId", checkPermission("cashier", "update"), async (req, res, next) => {
  try {
    const { cashierId } = req.params;
    const updatedData = req.body;
    const updatedCashier = await updateCashier(cashierId, updatedData);
    res.status(200).json({ success: true, data: updatedCashier });
  } catch (error) {
    next(error);
  }
});

// Delete a cashier
router.delete("/:cashierId", checkPermission("cashier", "delete"), async (req, res, next) => {
  try {
    const { cashierId } = req.params;
    const deletedCashier = await deleteCashier(cashierId);
    res.status(200).json({ success: true, data: deletedCashier });
  } catch (error) {
    next(error);
  }
});

// Get a cashier by email
router.get("/email", checkPermission("cashier", "read"), async (req, res, next) => {
  try {
    const { email } = req.query;
    const cashier = await getCashierByEmail(email);
    res.status(200).json({ success: true, data: cashier });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
