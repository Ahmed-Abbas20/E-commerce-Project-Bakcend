const User = require("../models/base.model"); 
const Staff = require("../models/staff.model"); 
const bcrypt = require("bcrypt");
const { AppError } = require("../utils/errorHandler");

// Get all managers
module.exports.getManagers = async () => {
  try {
    const managers = await Staff.find({ role: "manager" }).populate("managerId", "firstName lastName email");
    return managers;
  } catch (error) {
    throw new AppError("Error fetching managers: " + error.message, 500);
  }
};

// Create a new manager
module.exports.createManager = async ({ firstName, lastName, email, password, phone1, SSN, managerId }) => {
  try {
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    const managerData = {
      firstName,
      lastName,
      email,
      phone1,
      userType: "staff",
      password: hashedPassword,
      salt,
      role: "manager",
      SSN,
      managerId,
    };

    let manager = new Staff(managerData);

    
    await manager.save();

   
    const claims = {
      sub: manager._id,
      email: manager.email,
      userType: manager.userType,
      role: manager.role,
    };

    return claims;
  } catch (error) {
    throw new AppError("Error creating manager: " + error.message, 500);
  }
};

// Update a manager
module.exports.updateManager = async (managerId, updatedData) => {
  try {
    const updatedManager = await Staff.findByIdAndUpdate(managerId, updatedData, { new: true });

    if (!updatedManager) {
      throw new AppError("Manager not found", 404);
    }

    return updatedManager;
  } catch (error) {
    throw new AppError("Error updating manager: " + error.message, 500);
  }
};

// Delete a manager
module.exports.deleteManager = async (managerId) => {
  try {
    const deletedManager = await Staff.findByIdAndDelete(managerId);
    
    if (!deletedManager) {
      throw new AppError("Manager not found", 404);
    }

    return deletedManager;
  } catch (error) {
    throw new AppError("Error deleting manager: " + error.message, 500);
  }
};

// Get a manager by email
module.exports.getManagerByEmail = async (email) => {
  try {
    const manager = await Staff.findOne({ email, role: "manager" });

    if (!manager) {
      throw new AppError("Manager not found", 404);
    }

    return manager;
  } catch (error) {
    throw new AppError("Error fetching manager by email: " + error.message, 500);
  }
};
