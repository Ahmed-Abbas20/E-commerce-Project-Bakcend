const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserByEmail,
  updateUser,
  deleteUser,
} = require("../services/user.service");

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a user by email
router.get("/email", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await getUserByEmail({ email });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a user
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedData = req.body;
    const updatedUser = await updateUser(userId, updatedData);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a user
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await deleteUser(userId);
    res.status(200).json({ success: true, data: deletedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;