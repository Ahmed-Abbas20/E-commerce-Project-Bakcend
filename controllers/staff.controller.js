const express = require("express");
const router = express.Router();
const { checkPermission } = require("../middlewares/authorization.middleware"); // Import the permission middleware
const {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByEmail,
} = require("../repos/staff.repo");

// CRUD operations for Staff Members

// Get all staff members
router.get("/", [checkPermission("staff", "read")], async (req, res, next) => {
  try {
    const staffMembers = await getStaff();
    res.status(200).json({ success: true, data: staffMembers });
  } catch (error) {
    next(error);
  }
});

// Create a new staff member (only super_admin can create managers)
router.post("/", [checkPermission("staff", "create")], async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, userType = "staff", role, managerId, SSN } = req.body;
    const claims = await createStaff({ firstName, lastName, email, password, phone1, userType, role, managerId, SSN });
    res.status(201).json({ success: true, claims });
  } catch (error) {
    next(error);
  }
});

// Update a staff member (only allowed by super_admin or manager)
router.put("/:staffId", [checkPermission("staff", "update")], async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const updatedData = req.body;
    const updatedStaff = await updateStaff(staffId, updatedData);
    res.status(200).json({ success: true, data: updatedStaff });
  } catch (error) {
    next(error);
  }
});

// Delete a staff member (only super_admin can delete managers)
router.delete("/:staffId", [checkPermission("staff", "delete")], async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const deletedStaff = await deleteStaff(staffId);
    res.status(200).json({ success: true, data: deletedStaff });
  } catch (error) {
    next(error);
  }
});

// Get a staff member by email
router.get("/email", [checkPermission("staff", "read")], async (req, res, next) => {
  try {
    const { email } = req.query;
    const staffMember = await getStaffByEmail({ email });
    res.status(200).json({ success: true, data: staffMember });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
