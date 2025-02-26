const Staff = require("../models/staff.model");
const bcrypt = require("bcrypt");
const { AppError } = require("../utils/errorHandler");
const mongoose = require("mongoose");
const { uploadUserImage } = require("../services/userImageUpload.service");

// Create a new manager
module.exports.createManager = async ({ firstName, lastName, email, password, phone1, SSN, branchId }) => {
  try {
    const existingManager = await Staff.findOne({ $or: [{ email }, { phone1 }] });

    if (existingManager) {
      throw new AppError("Manager with this email or phone already exists", 400);
    }

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

   
    const formattedManager = manager.toObject();
    delete formattedManager.password;
    delete formattedManager.salt;

    
    if (formattedManager.image?.filePath) {
      formattedManager.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formattedManager.image.filePath}`;
    }

    return formattedManager;
  } catch (error) {
    throw new AppError(`Error creating manager: ${error.message}`, 500);
  }
};


// Get all managers
module.exports.getAllManagers = async (page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    // Get total count of managers
    const totalManagers = await Staff.countDocuments({ role: "manager" });

    // Fetch paginated managers
    const managers = await Staff.find({ role: "manager" })
      .populate("branchId", "name location phone")
      .select("-password -salt")
      .skip(skip)
      .limit(limit);

    const formattedManagers = managers.map(manager => {
      const formatted = manager.toObject();
      if (formatted.image?.filePath) {
        formatted.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formatted.image.filePath}`;
      }
      return formatted;
    });

    return {
      managers: formattedManagers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalManagers / limit),
        totalManagers
      }
    };

  } catch (error) {
    throw new AppError(`Error fetching managers: ${error.message}`, 500);
  }
};



// Get a manager by ID
module.exports.getManagerById = async (managerId) => {
  try {
    const manager = await Staff.findOne({ _id: managerId, role: "manager" })
      .populate("branchId", "name location phone")
      .select("-password -salt");

    if (!manager) throw new AppError("Manager not found", 404);

    const formattedManager = manager.toObject();
    if (formattedManager.image?.filePath) {
      formattedManager.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formattedManager.image.filePath}`;
    }

    return formattedManager;
  } catch (error) {
    throw new AppError(`Error fetching manager: ${error.message}`, 500);
  }
};


// Update a manager (Supports image upload)
module.exports.updateManager = async (managerId, updatedData, uploadedFile = []) => {
  try {
    const existingManager = await Staff.findOne({ _id: managerId, role: "manager" });

    if (!existingManager) throw new AppError("Manager not found", 404);

    
    const imageUpdate = await uploadUserImage(existingManager.image?.fileId, uploadedFile);
    if (imageUpdate) updatedData.image = imageUpdate;

    Object.assign(existingManager, updatedData);
    await existingManager.save();

    
    const formattedManager = existingManager.toObject();
    delete formattedManager.password;
    delete formattedManager.salt;

    if (formattedManager.image?.filePath) {
      formattedManager.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formattedManager.image.filePath}`;
    }

    return formattedManager;
  } catch (error) {
    throw new AppError(`Error updating manager: ${error.message}`, 500);
  }
};

// Delete a manager
module.exports.deleteManager = async (managerId) => {
  try {
    const deletedManager = await Staff.findOneAndDelete({ _id: managerId, role: "manager" });
    if (!deletedManager) throw new AppError("Manager not found", 404);
    return deletedManager;
  } catch (error) {
    throw new AppError(`Error deleting manager: ${error.message}`, 500);
  }
};
