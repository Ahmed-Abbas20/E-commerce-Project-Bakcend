const Staff = require("../models/staff.model");
const bcrypt = require("bcrypt");
const { AppError } = require("../utils/errorHandler");
const mongoose = require("mongoose");
const { uploadUserImage } = require("../services/userImageUpload.service");

// ✅ Create a new Clerk
module.exports.createClerk = async ({ firstName, lastName, email, password, phone1, SSN, managerId }) => {
  try {
    const managerObjectId = managerId ? new mongoose.Types.ObjectId(managerId) : undefined;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const clerk = new Staff({
      firstName,
      lastName,
      email,
      phone1,
      userType: "staff",
      password: hashedPassword,
      salt,
      role: "clerk",
      SSN,
      managerId: managerObjectId,
    });

    await clerk.save();
    return clerk;
  } catch (error) {
    throw new AppError(`Error creating clerk: ${error.message}`, 500);
  }
};

// ✅ Get all Clerks
module.exports.getAllClerks = async () => {
  try {
    return await Staff.find({ role: "clerk" }).populate("managerId", "firstName lastName email");
  } catch (error) {
    throw new AppError(`Error fetching clerks: ${error.message}`, 500);
  }
};

// ✅ Get a Clerk by ID
module.exports.getClerkById = async (clerkId) => {
  try {
    const clerk = await Staff.findOne({ _id: clerkId, role: "clerk" });
    if (!clerk) throw new AppError("Clerk not found", 404);
    return clerk;
  } catch (error) {
    throw new AppError(`Error fetching clerk: ${error.message}`, 500);
  }
};

// ✅ Update a Clerk (Supports image upload)
module.exports.updateClerk = async (clerkId, updatedData, uploadedFile = []) => {
  try {
    const existingClerk = await Staff.findOne({ _id: clerkId, role: "clerk" });

    if (!existingClerk) throw new AppError("Clerk not found", 404);

    // ✅ Handle image upload (if a new image is uploaded)
    const imageUpdate = await uploadUserImage(existingClerk.image?.fileId, uploadedFile);
    if (imageUpdate) updatedData.image = imageUpdate;

    Object.assign(existingClerk, updatedData);
    await existingClerk.save();

    return existingClerk;
  } catch (error) {
    throw new AppError(`Error updating clerk: ${error.message}`, 500);
  }
};

// ✅ Delete a Clerk
module.exports.deleteClerk = async (clerkId) => {
  try {
    const deletedClerk = await Staff.findOneAndDelete({ _id: clerkId, role: "clerk" });
    if (!deletedClerk) throw new AppError("Clerk not found", 404);
    return deletedClerk;
  } catch (error) {
    throw new AppError(`Error deleting clerk: ${error.message}`, 500);
  }
};
