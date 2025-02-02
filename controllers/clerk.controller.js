const express = require("express");
const router = express.Router();
const  checkPermission  = require("../middlewares/authorization.middleware");
const {
  getClerks,
  createClerk,
  updateClerk,
  deleteClerk,
  getClerkByEmail,
} = require("../repos/clerk.repo");

// Get all clerks
router.get("/", checkPermission("clerk", "read"), async (req, res, next) => {
  try {
    const clerks = await getClerks();
    res.status(200).json({ success: true, data: clerks });
  } catch (error) {
    next(error);
  }
});

// Create a new clerk
router.post("/", checkPermission("clerk", "create"), async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, managerId, SSN } = req.body;
    const claims = await createClerk({ firstName, lastName, email, password, phone1, managerId, SSN });
    res.status(201).json({ success: true, claims });
  } catch (error) {
    next(error);
  }
});

// Update a clerk
router.put("/:clerkId", checkPermission("clerk", "update"), async (req, res, next) => {
  try {
    const { clerkId } = req.params;
    const updatedData = req.body;
    const updatedClerk = await updateClerk(clerkId, updatedData);
    res.status(200).json({ success: true, data: updatedClerk });
  } catch (error) {
    next(error);
  }
});

// Delete a clerk
router.delete("/:clerkId", checkPermission("clerk", "delete"), async (req, res, next) => {
  try {
    const { clerkId } = req.params;
    const deletedClerk = await deleteClerk(clerkId);
    res.status(200).json({ success: true, data: deletedClerk });
  } catch (error) {
    next(error);
  }
});

// Get a clerk by email
router.get("/email", checkPermission("clerk", "read"), async (req, res, next) => {
  try {
    const { email } = req.query;
    const clerk = await getClerkByEmail(email);
    res.status(200).json({ success: true, data: clerk });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
