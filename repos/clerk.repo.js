const User = require("../models/base.model"); 
const Staff = require("../models/staff.model"); 
const bcrypt = require("bcrypt");
const { AppError } = require("../utils/errorHandler");

// Get all clerks
module.exports.getClerks = async () => {
  try {
    const clerks = await Staff.find({ role: "clerk" }).populate("managerId", "firstName lastName email");
    return clerks;
  } catch (error) {
    throw new AppError("Error fetching clerks: " + error.message, 500);
  }
};

// Create a new clerk
module.exports.createClerk = async ({ firstName, lastName, email, password, phone1, SSN, managerId }) => {
  try {
   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const clerkData = {
      firstName,
      lastName,
      email,
      phone1,
      userType: "staff",
      password: hashedPassword,
      salt,
      role: "clerk",
      SSN,
      managerId,
    };

    let clerk = new Staff(clerkData);

   
    await clerk.save();

   
    const claims = {
      sub: clerk._id,
      email: clerk.email,
      userType: clerk.userType,
      role: clerk.role,
    };

    return claims;
  } catch (error) {
    throw new AppError("Error creating clerk: " + error.message, 500);
  }
};

// Update a clerk
module.exports.updateClerk = async (clerkId, updatedData) => {
  try {
    const updatedClerk = await Staff.findByIdAndUpdate(clerkId, updatedData, { new: true });

    if (!updatedClerk) {
      throw new AppError("Clerk not found", 404);
    }

    return updatedClerk;
  } catch (error) {
    throw new AppError("Error updating clerk: " + error.message, 500);
  }
};

// Delete a clerk
module.exports.deleteClerk = async (clerkId) => {
  try {
    const deletedClerk = await Staff.findByIdAndDelete(clerkId);
    
    if (!deletedClerk) {
      throw new AppError("Clerk not found", 404);
    }

    return deletedClerk;
  } catch (error) {
    throw new AppError("Error deleting clerk: " + error.message, 500);
  }
};

// Get a clerk by email
module.exports.getClerkByEmail = async (email) => {
  try {
    const clerk = await Staff.findOne({ email, role: "clerk" });

    if (!clerk) {
      throw new AppError("Clerk not found", 404);
    }

    return clerk;
  } catch (error) {
    throw new AppError("Error fetching clerk by email: " + error.message, 500);
  }
};
