const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserByEmail,
  updateUser,
  deleteUser,
} = require("../services/user.service");
const {AppError} = require("../utils/errorHandler");  

// Get all users
router.get("/",async (req, res, next) => {
  try {
    const users = await getUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
   
    return next(new AppError(error.message, 500));
  }
});

// Get a user by email
router.get("/email", async (req, res, next) => {
  try {
    const { email } = req.query;
    const user = await getUserByEmail({ email });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
   
    return next(new AppError(error.message, 500));
  }
});

// Update a user
router.put("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updatedData = req.body;
    const updatedUser = await updateUser(userId, updatedData);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
  
    return next(new AppError(error.message, 500));
  }
});

// Delete a user
router.delete("/:userId",async (req, res, next) => {
  try {
    const { userId } = req.params;
    const deletedUser = await deleteUser(userId);
    res.status(200).json({ success: true, data: deletedUser });
  } catch (error) {
    
    return next(new AppError(error.message, 500));
  }
});

module.exports = router;
