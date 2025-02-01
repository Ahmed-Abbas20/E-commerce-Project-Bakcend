const { signToken } = require("../utils/jwttoken.manager");
const { createUser, getUserByEmail } = require("../services/user.service");

// Register user
const registerUser = async ({ firstName, lastName, email, password, phone1, userType = "customer", role }) => {
  try {
   

    // Create the user
    const claims = await createUser({ firstName, lastName, email, password, phone1, userType, role });

    // Generate a token for the new user
    const token = signToken({ claims });

    return { token };
  } catch (error) {
    throw new Error("Error registering user: " + error.message);
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
      throw new Error("Invalid email or password");
    }

    // Generate a token for the user
    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role,
    };
   console.log(claims);
    const token = signToken({ claims });

    return { token };
  } catch (error) {
    throw new Error("Error logging in user: " + error.message);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
