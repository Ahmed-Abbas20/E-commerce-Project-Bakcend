const { signToken } = require("../utils/jwttoken.manager");
const { createUser, getUserByEmail } = require("../services/user.service");
const {AppError} = require("../utils/errorHandler"); // Import the AppError class

// Register user
const registerUser = async ({ firstName, lastName, email, password, phone1, userType = "customer", role }) => {
  try {
    // Create the user
    const claims = await createUser({ firstName, lastName, email, password, phone1, userType, role });

    // Generate a token for the new user
    const token = signToken({ claims });

    return { token };
  } catch (error) {
    // Use AppError to throw a more structured error
    throw new AppError("Error registering user: " + error.message, 500);
  }
};

// Login user
const loginUser = async ({ email, password }) => {
  try {
    // Find the user by email
    const user = await getUserByEmail({ email });

    // Check if the password is correct
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new AppError("Invalid email or password", 401); // Invalid credentials error
    }

    // Generate a token for the user
    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role,
    };

    const token = signToken({ claims });

    return { token };
  } catch (error) {
    // Use AppError to throw a more structured error
    throw new AppError("Error logging in user: " + error.message, 500);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
