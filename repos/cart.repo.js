const Cart = require("../models/cart.model");

// Create or update a cart
exports.createOrUpdateCart = async (customerId, products) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { customerId },
      { $set: { products } },
      { new: true, upsert: true }
    );
    return cart;
  } catch (error) {
    throw new Error("Error updating cart: " + error.message);
  }
};

// Get cart by customer ID
exports.getCartByCustomerId = async (customerId) => {
  try {
    const cart = await Cart.findOne({ customerId }).populate("products.productId");
    return cart;
  } catch (error) {
    throw new Error("Error fetching cart: " + error.message);
  }
};

// Delete a cart
exports.deleteCart = async (customerId) => {
  try {
    await Cart.findOneAndDelete({ customerId });
  } catch (error) {
    throw new Error("Error deleting cart: " + error.message);
  }
};

// Add a product to the cart
exports.addProductToCart = async (customerId, productId, requiredQty) => {
  try {
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex > -1) {
      cart.products[productIndex].requiredQty += requiredQty;
    } else {
      cart.products.push({ productId, requiredQty });
    }

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error("Error adding product to cart: " + error.message);
  }
};

// Remove a product from the cart
exports.removeProductFromCart = async (customerId, productId) => {
  try {
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error("Error removing product from cart: " + error.message);
  }
};