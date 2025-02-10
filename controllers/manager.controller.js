const express = require("express");
const router = express.Router();
const checkPermission  = require("../middlewares/authorization.middleware");
const {
  getManagers,
  createManager,
  updateManager,
  deleteManager,
  getManagerByEmail,
} = require("../repos/manager.repo");

// Get all managers
router.get("/", checkPermission("manager", "read"), async (req, res, next) => {
  try {
    const managers = await getManagers();
    res.status(200).json({ success: true, data: managers });
  } catch (error) {
    next(error);
  }
});

// Create a new manager (Only super_admin can create managers)
router.post("/", checkPermission("manager", "create"), async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, managerId, SSN } = req.body;
    const claims = await createManager({ firstName, lastName, email, password, phone1, managerId, SSN });
    res.status(201).json({ success: true, claims });
  } catch (error) {
    next(error);
  }
});

// Update a manager (Only super_admin can update managers)
router.put("/:managerId", checkPermission("manager", "update"), async (req, res, next) => {
  try {
    const { managerId } = req.params;
    const updatedData = req.body;
    const updatedManager = await updateManager(managerId, updatedData);
    res.status(200).json({ success: true, data: updatedManager });
  } catch (error) {
    next(error);
  }
});

// Delete a manager (Only super_admin can delete managers)
router.delete("/:managerId", checkPermission("manager", "delete"), async (req, res, next) => {
  try {
    const { managerId } = req.params;
    const deletedManager = await deleteManager(managerId);
    res.status(200).json({ success: true, data: deletedManager });
  } catch (error) {
    next(error);
  }
});

// Get a manager by email
router.get("/email", checkPermission("manager", "read"), async (req, res, next) => {
  try {
    const { email } = req.query;
    const manager = await getManagerByEmail(email);
    res.status(200).json({ success: true, data: manager });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
