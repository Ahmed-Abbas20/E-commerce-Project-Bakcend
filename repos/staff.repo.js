const Staff = require("../models/staff.model"); 
const { AppError } = require("../utils/errorHandler"); 
const bcrypt = require("bcrypt");

// Get all staff members
module.exports.getStaff = async () => {
  try {
    const staffMembers = await Staff.find({}).populate("managerId"); // Populate the managerId field
    return staffMembers;
  } catch (error) {
    throw new AppError("Error fetching staff: " + error.message, 500);
  }
};

// Create a new staff member
module.exports.createStaff = async ({ firstName, lastName, email, password, phone1, userType = "staff", role, managerId, SSN }) => {
  try {
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const staffData = {
      firstName,
      lastName,
      email,
      phone1,
      userType,
      password: hashedPassword,
      salt,
      role,
      managerId, 
      SSN,
    };

   
    const staffMember = new Staff(staffData);
    await staffMember.save();

  
    const claims = {
      sub: staffMember._id,
      email: staffMember.email,
      userType: staffMember.userType,
      role: staffMember.role,
    };

    return claims;
  } catch (error) {
    throw new AppError("Error creating staff member: " + error.message, 500);
  }
};

// Update a staff member
module.exports.updateStaff = async (staffId, updatedData) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(staffId, updatedData, { new: true });
    if (!updatedStaff) {
      throw new AppError("Staff member not found", 404);
    }
    return updatedStaff;
  } catch (error) {
    throw new AppError("Error updating staff member: " + error.message, 500);
  }
};

// Delete a staff member
module.exports.deleteStaff = async (staffId) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(staffId);
    if (!deletedStaff) {
      throw new AppError("Staff member not found", 404);
    }
    return deletedStaff;
  } catch (error) {
    throw new AppError("Error deleting staff member: " + error.message, 500);
  }
};

// Get a staff member by email
module.exports.getStaffByEmail = async ({ email }) => {
  try {
    const staffMember = await Staff.findOne({ email }).populate("managerId"); // Populate the managerId field

    if (!staffMember) {
      throw new AppError("Staff member not found", 404);
    }

    return staffMember;
  } catch (error) {
    throw new AppError("Error fetching staff member by email: " + error.message, 500);
  }
};
