const Staff = require("../models/staff.model");
const bcrypt = require("bcrypt");
const { AppError } = require("../utils/errorHandler");
const mongoose = require("mongoose");
const { uploadUserImage } = require("../services/userImageUpload.service");

// ✅ Create a new manager
module.exports.createManager = async ({ firstName, lastName, email, password, phone1, SSN, managerId }) => {
  try {
    
    const managerObjectId = managerId ? new mongoose.Types.ObjectId(managerId) : undefined;
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
      managerId: managerObjectId, 
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
    return await Staff.find({ role: "manager" }).populate("managerId", "firstName lastName email");
  } catch (error) {
    throw new AppError(`Error fetching managers: ${error.message}`, 500);
  }
};

// ✅ Get a manager by ID
module.exports.getManagerById = async (managerId) => {
  try {
    const manager = await Staff.findOne({ _id: managerId, role: "manager" });
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
