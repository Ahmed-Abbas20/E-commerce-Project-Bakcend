const { signToken } = require("../utils/jwttoken.manager");
const { AppError } = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { createCustomer } = require("../repos/customer.repo");
const { createSeller } = require("../repos/seller.repo");
const User = require("../models/base.model");
const Cart = require("../models/cart.model");
const Branch = require("../models/branch.model"); // Import the Branch model

// Helper function to get the branch by name
const getBranchByName = async (branchName) => {
  const branch = await Branch.findOne({ name: branchName });
  if (!branch) {
    throw new AppError(`Branch with name "${branchName}" not found`, 404);
  }
  return branch;
};

// Register user
const registerUser = async (userData) => {
  try {
    const { firstName, lastName, email, password, phone1, userType = "customer", companyName, companyRegistrationNumber, SSN, guestCartId } = userData;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;

    // Create the user based on their type (seller or customer)
    if (userType === "seller") {
      user = await createSeller({ firstName, lastName, email, phone1, password: hashedPassword, salt, companyName, companyRegistrationNumber, SSN });
    } else {
      user = await createCustomer({ firstName, lastName, email, phone1, password: hashedPassword, salt });
    }

    // Fetch the branch by name
    const branch = await getBranchByName("Website Branch");

    let cart;

    // Check if a guest cart ID was provided
    if (guestCartId) {
      // Find the guest cart
      const guestCart = await Cart.findById(guestCartId);
      if (guestCart) {
        // Create a new cart for the customer and transfer products from the guest cart
        cart = new Cart({
          userId: user._id,
          branchId: branch._id, // Use the branch ID fetched by name
          products: guestCart.products, // Transfer products
        });
        await cart.save();

        // Delete the guest cart (optional)
        await Cart.findByIdAndDelete(guestCartId);
      } else {
        // If the guest cart doesn't exist, create an empty cart
        cart = new Cart({ userId: user._id, branchId: branch._id, products: [] });
        await cart.save();
      }
    } else {
      // If no guest cart ID was provided, create an empty cart
      cart = new Cart({ userId: user._id, branchId: branch._id, products: [] });
      await cart.save();
    }

    // Generate a token
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

// Login user
const loginUser = async ({ email, password }) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if the user is active
    if (!user.isActive) {
      throw new AppError("This account has been deactivated", 403);
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate a token
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
  registerUser,
  loginUser,
};