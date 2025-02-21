const express = require("express");
const router = express.Router();
const {
  getAllCashiers,
  getCashierById,
  createCashier,
  updateCashier,
  deleteCashier,
} = require("../repos/cashier.repo");
const { AppError } = require("../utils/errorHandler");
const checkPermission = require("../middlewares/authorization.middleware");

// Create a new cashier (Uses `createCashier` from the repo)
router.post("/", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, SSN, branchId } = req.body;

    if (!firstName || !lastName || !email || !password || !phone1 || !SSN || !branchId) {
      return next(new AppError("All required fields must be provided", 400));
    }

    const newCashier = await createCashier({
      firstName,
      lastName,
      email,
      password,
      phone1,
      SSN,
      branchId,
    });

    res.status(201).json({ success: true, data: newCashier });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get all cashiers
router.get("/", async (req, res, next) => {
  try {
    const cashiers = await getAllCashiers();
    res.status(200).json({ success: true, data: cashiers });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get cashier details using the ID from the token
router.get("/my/profile", async (req, res, next) => {
  try {
    const cashierId = req.user.sub; // Extract cashier ID from token
    if (!cashierId) {
      throw new AppError("Cashier ID is missing from token", 400);
    }

    const cashier = await getCashierById(cashierId);
    res.status(200).json({ success: true, data: cashier });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});
// Get a cashier by ID
router.get("/:cashierId", async (req, res, next) => {
  try {
    const { cashierId } = req.params;
    const cashier = await getCashierById(cashierId);
    res.status(200).json({ success: true, data: cashier });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

router.put("/my/profile", async (req, res, next) => {
  try {
    const cashierId = req.user.sub; // Extract from token
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedCashier = await updateCashier(cashierId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedCashier });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});


// Update a cashier (Supports image upload)
router.put("/:cashierId", async (req, res, next) => {
  try {
    const { cashierId } = req.params;
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedCashier = await updateCashier(cashierId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedCashier });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// Delete a cashier
router.delete("/:cashierId", async (req, res, next) => {
  try {
    const { cashierId } = req.params;
    const deletedCashier = await deleteCashier(cashierId);
    res.status(200).json({ success: true, data: deletedCashier });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = router;