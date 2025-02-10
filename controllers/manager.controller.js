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


// ✅ Create a new manager (Uses `createManager` from the repo)
router.post("/", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, SSN, managerId } = req.body;

    if (!firstName || !lastName || !email || !password || !phone1 || !SSN) {
      return next(new AppError("All required fields must be provided", 400));
    }

    const newManager = await createManager({
      firstName,
      lastName,
      email,
      password,
      phone1,
      SSN,
      managerId,
    });

    res.status(201).json({ success: true, data: newManager });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Get all managers
router.get("/", async (req, res, next) => {
  try {
    const managers = await getAllManagers();
    res.status(200).json({ success: true, data: managers });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Get a manager by ID
router.get("/:managerId", async (req, res, next) => {
  try {
    const { managerId } = req.params;
    const manager = await getManagerById(managerId);
    res.status(200).json({ success: true, data: manager });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});



// ✅ Update a manager (Supports image upload)
router.put("/:managerId", async (req, res, next) => {
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
router.delete("/:managerId", async (req, res, next) => {
  try {
    const { managerId } = req.params;
    const deletedManager = await deleteManager(managerId);
    res.status(200).json({ success: true, data: deletedManager });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = router;
