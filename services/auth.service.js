const { createCustomer, getCustomerByEmail } = require("../services/user.service");
const Customer = require("../models/base.model");
const Cart = require("../models/cart.model");
const bcrypt = require("bcrypt");
const { signToken } = require("../utils/jwttoken.manager");
const { AppError } = require("../utils/errorHandler");

// Register Customer
const registerCustomer = async ({ firstName, lastName, email, password, phone1, userType = "customer", guestCartId }) => {
  try {
    // Check if the email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      throw new AppError("Email already exists", 400);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the customer object
    const customerData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone1,
      userType,
      salt,
    };

    // Save the customer to the database
    const customer = new Customer(customerData);
    await customer.save();

    let cart;

    // Check if a guest cart ID was provided
    if (guestCartId) {
      // Find the guest cart
      const guestCart = await Cart.findById(guestCartId);
      if (guestCart) {
        // Create a new cart for the customer and transfer products from the guest cart
        cart = new Cart({
          customerId: customer._id,
          products: guestCart.products, // Transfer products
        });
        await cart.save();

        // Delete the guest cart (optional)
        await Cart.findByIdAndDelete(guestCartId);
      } else {
        // If the guest cart doesn't exist, create an empty cart
        cart = new Cart({ customerId: customer._id, products: [] });
        await cart.save();
      }
    } else {
      // If no guest cart ID was provided, create an empty cart
      cart = new Cart({ customerId: customer._id, products: [] });
      await cart.save();
    }

    // Generate a token with cart ID in the claims
    const claims = {
      sub: customer._id,
      email: customer.email,
      userType: customer.userType,
      cartId: cart._id, // Include the cart ID in the claims
    };
    const token = signToken({ claims });

    return { token };
  } catch (error) {
    throw new AppError("Error registering customer: " + error.message, 500);
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
