const Staff = require("../models/staff.model");
const bcrypt = require("bcrypt");
const { AppError } = require("../utils/errorHandler");
const mongoose = require("mongoose");
const { uploadUserImage } = require("../services/userImageUpload.service");

// ✅ Create a new manager
module.exports.createManager = async ({ firstName, lastName, email, password, phone1, SSN, branchId }) => {
  try {
    const branchObjectId = new mongoose.Types.ObjectId(branchId);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const manager = new Staff({
      firstName,
      lastName,
      email,
      phone1,
      userType: "staff",
      password: hashedPassword,
      salt,
      role: "manager",
      SSN,
      branchId: branchObjectId, 
    });

    await manager.save();
    return manager;
  } catch (error) {
    throw new AppError(`Error creating manager: ${error.message}`, 500);
  }
};

// ✅ Get all managers
module.exports.getAllManagers = async () => {
  try {
    return await Staff.find({ role: "manager" }).populate("branchId", "name location phone");
  } catch (error) {
    throw new AppError(`Error fetching managers: ${error.message}`, 500);
  }
};

// ✅ Get a manager by ID
module.exports.getManagerById = async (managerId) => {
  try {
    const manager = await Staff.findOne({ _id: managerId, role: "manager" }).populate("branchId", "name location phone");
    if (!manager) throw new AppError("Manager not found", 404);
    return manager;
  } catch (error) {
    throw new AppError(`Error fetching manager: ${error.message}`, 500);
  }
};

// ✅ Update a manager (Supports image upload)
module.exports.updateManager = async (managerId, updatedData, uploadedFile = []) => {
  try {
    const existingManager = await Staff.findOne({ _id: managerId, role: "manager" });

    if (!existingManager) throw new AppError("Manager not found", 404);

    // ✅ Handle image upload (if a new image is uploaded)
    const imageUpdate = await uploadUserImage(existingManager.image?.fileId, uploadedFile);
    if (imageUpdate) updatedData.image = imageUpdate;

    Object.assign(existingManager, updatedData);
    await existingManager.save();

    return existingManager;
  } catch (error) {
    throw new AppError(`Error updating manager: ${error.message}`, 500);
  }
};

// ✅ Delete a manager
module.exports.deleteManager = async (managerId) => {
  try {
    const deletedManager = await Staff.findOneAndDelete({ _id: managerId, role: "manager" });
    if (!deletedManager) throw new AppError("Manager not found", 404);
    return deletedManager;
  } catch (error) {
    throw new AppError(`Error deleting manager: ${error.message}`, 500);
  }
};
