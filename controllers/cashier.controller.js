const express = require("express");
const router = express.Router();
const {
  getAllCashiers,
  getCashierById,
  createCashier,
  updateCashier,
  deleteCashier,
  getCashiersByBranch,
} = require("../repos/cashier.repo");
const { AppError } = require("../utils/errorHandler");
const checkPermission = require("../middlewares/authorization.middleware");

// Create a new cashier (Uses `createCashier` from the repo)
router.post("/",checkPermission("cashier","create"), async (req, res, next) => {
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
router.get("/", checkPermission("cashier", "getAll"), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { cashiers, pagination } = await getAllCashiers(page, limit);

    res.status(200).json({
      success: true,
      data: cashiers,
      pagination: pagination,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

//Get all cashiers in a branch using the branch ID from the token
router.get("/my-branch-cashiers", checkPermission("cashier", "getAllByMyBranch"), async (req, res, next) => {
  try {
    const branchId = req.user.branchId;

    if (!branchId) {
      throw new AppError("Branch ID not found in the token", 400);
    }

    const cashiers = await getCashiersByBranch(branchId);

    res.status(200).json({
      success: true,
      data: cashiers,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});



// Get cashier details using the ID from the token
router.get("/my/profile", async (req, res, next) => {
  try {
    const cashierId = req.user.sub; 
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
router.get("/:cashierId", checkPermission("cashier","getById"),async (req, res, next) => {
  try {
    const { role: userRole, branchId: userBranchId } = req.user; 
    const { cashierId } = req.params;

    const cashier = await getCashierById(cashierId);

    if (!cashier) {
      throw new AppError("Cashier not found", 404);
    }

    if (userRole === "manager" && cashier.branchId._id.toString() !== userBranchId) {
      throw new AppError("You do not have permission to access this cashier", 403);
    }

    res.status(200).json({ success: true, data: cashier });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});


router.put("/my/profile", async (req, res, next) => {
  try {
    const cashierId = req.user.sub; 
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedCashier = await updateCashier(cashierId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedCashier });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});


// Update a cashier (Supports image upload)
router.put("/:cashierId", checkPermission("cashier","updateById"),async (req, res, next) => {
  try {
    const { role: userRole, branchId: userBranchId } = req.user; 
    const { cashierId } = req.params;
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const cashier = await getCashierById(cashierId);
    if (!cashier) throw new AppError("Cashier not found", 404);

    if (userRole === "manager" && cashier.branchId._id.toString() !== userBranchId) {
      throw new AppError("You don't have permission to update this cashier.", 403);
    }

    const updatedCashier = await updateCashier(cashierId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedCashier });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// Delete a cashier
router.delete("/:cashierId",checkPermission("cashier","deleteById"), async (req, res, next) => {
  try {
    const { role: userRole, branchId: userBranchId } = req.user; 
    const { cashierId } = req.params;

    
    const cashier = await getCashierById(cashierId);
    if (!cashier) throw new AppError("Cashier not found", 404);

    if (userRole === "manager" && cashier.branchId._id.toString() !== userBranchId) {
      throw new AppError("You don't have permission to delete this cashier.", 403);
    }

    const deletedCashier = await deleteCashier(cashierId);
    res.status(200).json({ success: true, data: deletedCashier });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = router;