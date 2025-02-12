const express = require("express");
const router = express.Router();
const {
  getAllClerks,
  getClerkById,
  createClerk,
  updateClerk,
  deleteClerk,
} = require("../repos/clerk.repo");
const { AppError } = require("../utils/errorHandler");
const checkPermission = require("../middlewares/authorization.middleware"); 

// ✅ Create a new clerk (Uses `createClerk` from the repo)
router.post("/", checkPermission("clerks","create"),async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, SSN, managerId } = req.body;

    if (!firstName || !lastName || !email || !password || !phone1 || !SSN) {
      return next(new AppError("All required fields must be provided", 400));
    }

    const newClerk = await createClerk({
      firstName,
      lastName,
      email,
      password,
      phone1,
      SSN,
      managerId,
    });

    res.status(201).json({ success: true, data: newClerk });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Get all clerks
router.get("/", checkPermission("clerks","read"),async (req, res, next) => {
  try {
    const clerks = await getAllClerks();
    res.status(200).json({ success: true, data: clerks });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Get a clerk by ID
router.get("/:clerkId", checkPermission("clerks","read"),async (req, res, next) => {
  try {
    const { clerkId } = req.params;
    const clerk = await getClerkById(clerkId);
    res.status(200).json({ success: true, data: clerk });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Update a clerk (Supports image upload)
router.put("/:clerkId", checkPermission("clerks","update"),async (req, res, next) => {
  try {
    const { clerkId } = req.params;
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedClerk = await updateClerk(clerkId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedClerk });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// ✅ Delete a clerk
router.delete("/:clerkId", checkPermission("clerks","delete"),async (req, res, next) => {
  try {
    const { clerkId } = req.params;
    const deletedClerk = await deleteClerk(clerkId);
    res.status(200).json({ success: true, data: deletedClerk });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = router;
