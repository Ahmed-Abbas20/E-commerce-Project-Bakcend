const Customer = require("../models/base.model");
const bcrypt = require("bcrypt");

// Get all users
module.exports.getCustomer = async () => {
  try {
    const users = await Customer.find({});
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users");
  }
};

// Create a new user
module.exports.createCustomer = async ({ firstName, lastName, email, password, phone1, userType = "Customer" }) => {
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


    const user = new Customer(userData);
    await user.save();

    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
    };

    return claims;
  } catch (error) {
    console.error("Error in createUser:", error); // Debugging: Log the error
    throw new Error("Error creating user: " + error.message);
  }
};

// Update a user
module.exports.updateCustomer = async (userId, updatedData) => {
  try {
    const updatedUser = await Customer.findByIdAndUpdate(userId, updatedData, { new: true });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Error updating user");
  }
};

// Delete a user
module.exports.deleteCustomer = async (userId) => {
  try {
    const deletedUser = await Customer.findByIdAndDelete(userId);
    return deletedUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Error deleting user");
  }
};

// Get a user by email
module.exports.getCustomerByEmail = async ({ email }) => {
  try {
    const user = await Customer.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Error fetching user by email");
  }
};