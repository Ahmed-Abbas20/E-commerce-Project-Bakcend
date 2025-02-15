const Staff = require("../models/staff.model");
const bcrypt = require("bcrypt");
const { AppError } = require("../utils/errorHandler");
const mongoose = require("mongoose");
const { uploadUserImage } = require("../services/userImageUpload.service");

// ✅ Create a new cashier
module.exports.createCashier = async ({ firstName, lastName, email, password, phone1, SSN, branchId }) => {
  try {
    const branchObjectId = new mongoose.Types.ObjectId(branchId);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const cashier = new Staff({
      firstName,
      lastName,
      email,
      phone1,
      userType: "staff",
      password: hashedPassword,
      salt,
      role: "cashier",
      SSN,
      branchId: branchObjectId,
    });

    await cashier.save();
    return cashier;
  } catch (error) {
    throw new AppError(`Error creating cashier: ${error.message}`, 500);
  }
};

// ✅ Get all cashiers
module.exports.getAllCashiers = async () => {
  try {
    return await Staff.find({ role: "cashier" }).populate("branchId", "name location phone");
  } catch (error) {
    throw new AppError(`Error fetching cashiers: ${error.message}`, 500);
  }
};

// ✅ Get a cashier by ID
module.exports.getCashierById = async (cashierId) => {
  try {
    const cashier = await Staff.findOne({ _id: cashierId, role: "cashier" }).populate("branchId", "name location phone");
    if (!cashier) throw new AppError("Cashier not found", 404);
    return cashier;
  } catch (error) {
    throw new AppError(`Error fetching cashier: ${error.message}`, 500);
  }
};

// ✅ Update a cashier (Supports image upload)
module.exports.updateCashier = async (cashierId, updatedData, uploadedFile = []) => {
  try {
    const existingCashier = await Staff.findOne({ _id: cashierId, role: "cashier" });

    if (!existingCashier) throw new AppError("Cashier not found", 404);

    // ✅ Handle image upload (if a new image is uploaded)
    const imageUpdate = await uploadUserImage(existingCashier.image?.fileId, uploadedFile);
    if (imageUpdate) updatedData.image = imageUpdate;

    Object.assign(existingCashier, updatedData);
    await existingCashier.save();

    return existingCashier;
  } catch (error) {
    throw new AppError(`Error updating cashier: ${error.message}`, 500);
  }
};

// ✅ Delete a cashier
module.exports.deleteCashier = async (cashierId) => {
  try {
    const deletedCashier = await Staff.findOneAndDelete({ _id: cashierId, role: "cashier" });
    if (!deletedCashier) throw new AppError("Cashier not found", 404);
    return deletedCashier;
  } catch (error) {
    throw new AppError(`Error deleting cashier: ${error.message}`, 500);
  }
};
