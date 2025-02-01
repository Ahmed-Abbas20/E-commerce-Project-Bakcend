const User = require("../models/base.model");
const Staff = require("../models/staff.model");
const bcrypt = require("bcrypt");

// Get all users
module.exports.getUsers = async () => {
  try {
    const users = await User.find({});
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users");
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
        throw new Error("Role is required for staff members");
      }
      userData.role = role; // Ensure role is added to userData
      user = new Staff(userData);
      
    }


    // console.log("User Data Before Save:", userData); // Debugging: Log the user data before saving

    // Save the user to the database
   
    
   
    await user.save();

    // console.log("User Data After Save:", user); // Debugging: Log the user data after saving

    
    // Prepare claims for the token
    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role,
    };

    return claims;
  } catch (error) {
    console.error("Error in createUser:", error); // Debugging: Log the error
    throw new Error("Error creating user: " + error.message);
  }
};

// Update a user
module.exports.updateUser = async (userId, updatedData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Error updating user");
  }
};

// Delete a user
module.exports.deleteUser = async (userId) => {
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    return deletedUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Error deleting user");
  }
};

// Get a user by email
module.exports.getUserByEmail = async ({ email }) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Error fetching user by email");
  }
};