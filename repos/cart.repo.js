const Cart = require("../models/cart.model");
const Branch = require("../models/branch.model");

// Create or update a cart
exports.createOrUpdateCart = async (userId, branchId, products) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId, branchId },
      { $set: { products } },
      { new: true, upsert: true }
    );
    return cart;
  } catch (error) {
    throw new Error("Error updating cart: " + error.message);
  }
};

// Get cart by customer ID and branch ID
exports.getCartByUserId = async (userId, branchId) => {
  try {
    const cart = await Cart.findOne({ userId, branchId }).populate("products.productId");
    return cart;
  } catch (error) {
    throw new Error("Error fetching cart: " + error.message);
  }
};

// Delete a cart
exports.deleteCart = async (userId, branchId) => {
  try {
    await Cart.findOneAndDelete({ userId, branchId });
  } catch (error) {
    throw new Error("Error deleting cart: " + error.message);
  }
};

// Add a product to the cart
exports.addProductToCart = async (userId, branchId, productId, requiredQty) => {
  try {
    const branch = await Branch.findById(branchId);
    if (!branch) {
      throw new Error("Branch not found");
    }

    const productInBranch = branch.stock.find(
      (item) => item.productId.toString() === productId
    );

    if (!productInBranch) {
      throw new Error("Product not found in branch stock");
    }

    const cart = await Cart.findOne({ userId, branchId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity += requiredQty;
    } else {
      cart.products.push({ productId, quantity: requiredQty });
    }

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error("Error adding product to cart: " + error.message);
  }
};

// Remove a product from the cart
exports.removeProductFromCart = async (userId, branchId, productId) => {
  try {
    const cart = await Cart.findOne({ userId, branchId });
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