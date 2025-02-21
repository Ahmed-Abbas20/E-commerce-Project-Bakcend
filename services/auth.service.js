const { signToken } = require("../utils/jwttoken.manager");
const { AppError } = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { createCustomer } = require("../repos/customer.repo");
const { createSeller } = require("../repos/seller.repo");
const User = require("../models/base.model");
const Cart = require("../models/cart.model");
const Branch = require("../models/branch.model"); 

const getBranchByName = async (branchName) => {
  const branch = await Branch.findOne({ name: branchName });
  if (!branch) {
    throw new AppError(`Branch with name "${branchName}" not found`, 404);
  }
  return branch;
};
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
    const { firstName, lastName, email, password, phone1, userType = "customer", companyName, companyRegistrationNumber, SSN, guestCartId } = userData;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;

    // Create the user based on their type (seller or customer)
    if (userType === "seller") {
      user = await createSeller({ firstName, lastName, email, phone1, password: hashedPassword, salt, companyName, companyRegistrationNumber, SSN });
    } else {
      user = await createCustomer({ firstName, lastName, email, phone1, password: hashedPassword, salt });
    }

    let cart;

    if (guestCartId) {
      // Find the guest cart
      const guestCart = await Cart.findById(guestCartId);
      if (guestCart) {
        // Create a new cart for the customer and transfer products from the guest cart
        cart = new Cart({
          userId: user._id,
          products: guestCart.products, // Transfer products
        });
        await cart.save();
        await Cart.findByIdAndDelete(guestCartId);
      } else {
        cart = new Cart({ userId: user._id, products: [] });
        await cart.save();
      }
    }

    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      cartId: cart._id,
    };

    return { token: signToken({ claims }) };
  } catch (error) {
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
      throw new AppError("User didn't have a cart !", 401);
    }

    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role,
      cartId: cart._id,
    };
    // if (user.branchId) {
    //   claims.branchId = user.branchId;
    // }
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