const User = require("../models/base.model");
const Staff = require("../models/staff.model");
const bcrypt = require("bcrypt");
const {AppError} = require("../utils/errorHandler"); 

// Get all users
module.exports.getUsers = async () => {
  try {
    const users = await User.find({});
    return users;
  } catch (error) {
    throw new AppError("Error fetching users: " + error.message, 500); 
  }
};

// Create a new user
module.exports.createUser = async ({ firstName, lastName, email, password, phone1, userType = "customer", role }) => {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = {
      firstName,
      lastName,
      email,
      phone1,
      userType,
      password: hashedPassword,
      salt,
    };

    let user = new User(userData);
    // Add role for staff members
    if (userType === "staff") {
      if (!role) {
        throw new AppError("Role is required for staff members", 400); 
      }
      userData.role = role; 
      user = new Staff(userData);
    }

    // Save the user to the database
    await user.save();

    // Prepare claims for the token
    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role,
    };

    return claims;
  } catch (error) {
    throw new AppError("Error creating user: " + error.message, 500); 
  }
};

// Update a user
module.exports.updateUser = async (userId, updatedData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    if (!updatedUser) {
      throw new AppError("User not found", 404); 
    }
    return updatedUser;
  } catch (error) {
    throw new AppError("Error updating user: " + error.message, 500); 
  }
};

// Delete a user
module.exports.deleteUser = async (userId) => {
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new AppError("User not found", 404); 
    }
    return deletedUser;
  } catch (error) {
    throw new AppError("Error deleting user: " + error.message, 500); 
  }
};

// Get a user by email
module.exports.getUserByEmail = async ({ email }) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("User not found", 404); 
    }

    return user;
  } catch (error) {
    throw new AppError("Error fetching user by email: " + error.message, 500); 
  }
};
