const { signToken } = require("../utils/jwttoken.manager");
const { createCustomer, getCustomerByEmail } = require("../services/user.service");
const {AppError} = require("../utils/errorHandler"); // Import the AppError class

// Register user
const registerCustomer = async ({ firstName, lastName, email, password, phone1, userType = "customer", role }) => {
  try {
   
    const claims = await createCustomer({ firstName, lastName, email, password, phone1, userType, role });

    
    const token = signToken({ claims });

    return { token };
  } catch (error) {
   
    throw new AppError("Error registering user: " + error.message, 500);
  }
};

// Login user
const loginCustomer = async ({ email, password }) => {
  try {
   
    const user = await getCustomerByEmail({ email });

    
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new AppError("Invalid email or password", 401); 
    }

   
    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role,
    };

    const token = signToken({ claims });

    return { token };
  } catch (error) {
    
    throw new AppError("Error logging in user: " + error.message, 500);
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
};
