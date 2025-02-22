const { signToken } = require("../utils/jwttoken.manager");
const { AppError } = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { createCustomer } = require("../repos/customer.repo");
const { createSeller } = require("../repos/seller.repo");
const User = require("../models/base.model");
const Cart = require("../models/cart.model");



const softDeleteUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    user.isActive = false;
    await user.save();
    return user;
  } catch (error) {
    throw new AppError("Error soft deleting user: " + error.message, 500);
  }
};
const registerUser = async (userData) => {
  try {
    const { firstName, lastName, email, password, phone1, userType = "customer", companyName, companyRegistrationNumber, SSN, cart: guestCart } = userData;

    if (!firstName || !lastName || !email || !password || !phone1) {
      throw new AppError("Missing required fields", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;

    if (userType === "seller") {
      user = await createSeller({ firstName, lastName, email, phone1, password: hashedPassword, salt, companyName, companyRegistrationNumber, SSN });
    } else {
      user = await createCustomer({ firstName, lastName, email, phone1, password: hashedPassword, salt });
    }

    if (!user) {
      throw new AppError("Failed to create user", 500);
    }

    const cart = new Cart({
      userId: user._id,
      products: guestCart?.products || [],
    });
    await cart.save();

    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      cartId: cart._id,
    };

    return { token: signToken({ claims }) };
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw new AppError(`Error registering user: ${error.message}`, 500);
  }
};

const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError("This account has been deactivated", 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({ userId: user._id, products: [] });

      await cart.save();
    }

    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role,
      cartId: cart._id,
    };

     if (user.branchId) {
      claims.branchId = user.branchId;
     }

    const token = signToken({ claims });
   
    return { token };
  } catch (error) {
    throw new AppError("Error logging in user: " + error.message, 500);
  }
};

module.exports = {
  registerUser,
  loginUser,
  softDeleteUser
};