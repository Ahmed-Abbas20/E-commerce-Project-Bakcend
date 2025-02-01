const User = require("../models/base.model");
const bcrypt = require("bcrypt");


module.exports.getUsers = async () => {
  try {
    const users = await User.find({});
    return users;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching users");
  }
};

module.exports.updateUsers = async (userId, updatedData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    return updatedUser;
  } catch (error) {
    console.error(error);
    throw new Error("Error updating user");
  }
};


module.exports.createUser = async ({ firstName, lastName, email, password, phone1, userType = "Customer", role }) => {
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

    // Add role for staff members
    if (userType === "Staff") {
      if (!role) {
        throw new Error("Role is required for staff members");
      }
      userData.role = role; // Ensure role is added to userData
    }


    // Save the user to the database
    const user = new User(userData);
    await user.save();


    // Prepare claims for the token
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
module.exports.getUserByEmail = async ({ email }) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error("Error fetching user: " + error.message);
  }
};

module.exports.deleteUsers = async (userId) => {
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    return deletedUser;
  } catch (error) {
    console.error(error);
    throw new Error("Error deleting user");
  }
};
