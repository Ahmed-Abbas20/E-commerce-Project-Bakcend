const express = require("express");
const router = express.Router();
const {
  getAllManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager,
} = require("../repos/manager.repo");
const { AppError } = require("../utils/errorHandler");
const checkPermission = require("../middlewares/authorization.middleware");

// ✅ Create a new manager
router.post("/",  async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, SSN, branchId } = req.body;

    if (!firstName || !lastName || !email || !password || !phone1 || !SSN || !branchId) {
      return next(new AppError("All required fields must be provided", 400));
    }

    const newManager = await createManager({
      firstName,
      lastName,
      email,
      password,
      phone1,
      SSN,
      branchId,
    });

    res.status(201).json({ success: true, data: newManager });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Get all managers
router.get("/", checkPermission("managers", "read"), async (req, res, next) => {
  try {
    const managers = await getAllManagers();
    res.status(200).json({ success: true, data: managers });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Get a manager by ID
router.get("/:managerId", checkPermission("managers", "read"), async (req, res, next) => {
  try {
    const { managerId } = req.params;
    const manager = await getManagerById(managerId);
    res.status(200).json({ success: true, data: manager });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Update a manager (Supports image upload)
router.put("/:managerId", checkPermission("managers", "update"), async (req, res, next) => {
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

// ✅ Delete a manager
router.delete("/:managerId", checkPermission("managers", "delete"), async (req, res, next) => {
  try {
    const { managerId } = req.params;
    const deletedManager = await deleteManager(managerId);
    res.status(200).json({ success: true, data: deletedManager });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = router;
