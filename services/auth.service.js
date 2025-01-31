const { signToken } = require("../utils/jwttoken.manager");
const { createUser, getUserByEmail } = require("../services/user.service");
// register user

const registerUser = async ({ username, email, password ,profilePicture,user_id,first_name,last_name }) => {
  try {
    // Hash the password before saving the user
    const claims = await createUser({ username, email, password ,profilePicture,user_id,first_name,last_name });

    // Generate a token for the new user
    const token = signToken({
      claims,
    });

    return { token };
  } catch (error) {
    throw new Error("Error registering user: " + error.message);
  }
};

// login user

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
      sub: user.user_id,
      username: user.username,
      email: user.email,
      userType: user.user_type,
    };
    const token = signToken({
      claims,
    });

    return { token };
  } catch (error) {
    throw new Error("Error logging in user: " + error.message);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
