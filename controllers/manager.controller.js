const express = require("express");
const router = express.Router();
const {
  getAllManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager
} = require("../repos/manager.repo");
const { AppError } = require("../utils/errorHandler");
const checkPermission = require("../middlewares/authorization.middleware");


// Create a new manager
router.post("/",checkPermission("manager","create"), async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, SSN, branchId } = req.body;

    if (!firstName || !lastName || !email || !password || !phone1 || !SSN || !branchId) {
      return next(new AppError("All required fields must be provided", 400));
    }

    const newManager = await createManager({ firstName, lastName, email, password, phone1, SSN, branchId });

    res.status(201).json({ success: true, data: newManager });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get all managers
router.get("/", checkPermission("manager", "getAll"), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 20; 

    const { managers, pagination } = await getAllManagers(page, limit);

    res.status(200).json({
      success: true,
      data: managers,
      pagination: pagination,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get manager profile (from token)
router.get("/my/profile", async (req, res, next) => {
  try {
    const managerId = req.user.sub; 
    const manager = await getManagerById(managerId);
    res.status(200).json({ success: true, data: manager });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get manager by ID
router.get("/:managerId", checkPermission("manager","getById"),async (req, res, next) => {
  try {
    const { managerId } = req.params;
    const manager = await getManagerById(managerId);
    res.status(200).json({ success: true, data: manager });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});



// Update personal profile
router.put("/my/profile", async (req, res, next) => {
  try {
    const managerId = req.user.sub;
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedManager = await updateManager(managerId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedManager });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// Update a manager (Supports image upload)
router.put("/:managerId", checkPermission("manager","updateById"),async (req, res, next) => {
  try {
    const { managerId } = req.params;
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedManager = await updateManager(managerId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedManager });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});



// Delete a manager
router.delete("/:managerId", checkPermission("manager","deleteById"),async (req, res, next) => {
  try {
    const { managerId } = req.params;
    const deletedManager = await deleteManager(managerId);
    res.status(200).json({ success: true, data: deletedManager });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = router;
