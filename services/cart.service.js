const {
  createOrUpdateCart,
  getCartByUserId,
  deleteCart,
  addProductToCart,
  removeProductFromCart,
} = require("../repos/cart.repo");
const { AppError } = require("../utils/errorHandler");
const Cart = require("../models/cart.model");
const Branch = require("../models/branch.model");

// Fixed branch ID for the "online" branch
const ONLINE_BRANCH_ID = "67ae0ec67902b97afe1be51a";

// Create or update cart
exports.createOrUpdateCart = async (userId, products) => {
  try {
    const cart = await createOrUpdateCart(userId, ONLINE_BRANCH_ID, products);
    return cart;
  } catch (error) {
    throw new AppError("Error creating/updating cart: " + error.message, 500);
  }
};

// Get cart by user ID
exports.getCart = async (userId) => {
  try {
    // Fetch the cart
    const cart = await getCartByUserId(userId, ONLINE_BRANCH_ID);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    // Fetch the fixed branch
    const branch = await Branch.findById(ONLINE_BRANCH_ID);
    if (!branch) {
      throw new AppError("Branch not found", 404);
    }

    // Array to store changes for products with insufficient stock or unavailability
    const changes = [];

    // Validate each product in the cart
    for (const item of cart.products) {
      const productInBranch = branch.stock.find(
        (stockItem) => stockItem.productId.toString() === item.productId.toString()
      );

      if (!productInBranch) {
        // Product is no longer available in the branch
        changes.push({
          productName: item.productId.name || "Unknown product",
          status: "Product no longer available in branch stock",
        });
      } else if (productInBranch.quantity < item.quantity) {
        // Product quantity in stock is less than the quantity in the cart
        changes.push({
          productName: item.productId.name,
          status: `Only ${productInBranch.quantity} units available in branch stock (requested ${item.quantity})`,
        });
      }
    }

    // Return the cart and the changes (if any)
    return { cart, changes };
  } catch (error) {
    throw new AppError("Error fetching cart: " + error.message, 500);
  }
};

// Delete cart
exports.deleteCart = async (userId) => {
  try {
    await deleteCart(userId, ONLINE_BRANCH_ID);
  } catch (error) {
    throw new AppError("Error deleting cart: " + error.message, 500);
  }
};

// Empty cart
exports.emptyCart = async (userId) => {
  try {
    // Find the customer's cart
    const cart = await Cart.findOne({ userId, branchId: ONLINE_BRANCH_ID });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    // Empty the cart by setting the products array to an empty array
    cart.products = [];
    await cart.save();

    return cart;
  } catch (error) {
    throw new AppError("Error emptying cart: " + error.message, 500);
  }
};

// Add product to cart
exports.addProductToCart = async (userId, productId, quantity) => {
  try {
    // Fetch the fixed branch
    const branch = await Branch.findById(ONLINE_BRANCH_ID);
    if (!branch) {
      throw new AppError("Branch not found", 404);
    }

    // Check if the product exists in the branch stock
    const productInBranch = branch.stock.find(
      (item) => item.productId.toString() === productId
    );
    if (!productInBranch) {
      throw new AppError("Product not found in branch stock", 404);
    }

    // Find the customer's cart
    const cart = await Cart.findOne({ userId, branchId: ONLINE_BRANCH_ID });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    // Check if the product is already in the cart
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    let totalQuantity = quantity;

    if (productIndex > -1) {
      // If the product is already in the cart, calculate the total quantity
      totalQuantity += cart.products[productIndex].quantity;
    }

    // Validate that the total quantity does not exceed the available quantity
    if (totalQuantity > productInBranch.quantity) {
      throw new AppError(
        `Cannot add more than ${productInBranch.quantity} units of this product. You already have ${cart.products[productIndex]?.quantity || 0} units in your cart.`,
        400
      );
    }

    if (productIndex > -1) {
      // If the product is already in the cart, update the quantity
      cart.products[productIndex].quantity += quantity;
    } else {
      // If the product is not in the cart, add it
      cart.products.push({ productId, quantity });
    }

    // Save the updated cart
    await cart.save();

    return cart;
  } catch (error) {
    throw new AppError("Error adding product to cart: " + error.message, 500);
  }
};
exports.editProductQuantity = async (userId, productId, quantity) => {
  try {
    // Fetch the fixed branch ID
    const FIXED_BRANCH_ID = "67ae0ec67902b97afe1be51a";

    // Find the cart for the user and branch
    const cart = await Cart.findOne({ userId, branchId: FIXED_BRANCH_ID });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    // Find the product in the cart
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      throw new AppError("Product not found in cart", 404);
    }

    // Fetch the branch to validate product availability
    const branch = await Branch.findById(FIXED_BRANCH_ID);
    if (!branch) {
      throw new AppError("Branch not found", 404);
    }

    // Find the product in the branch stock
    const productInBranch = branch.stock.find(
      (item) => item.productId.toString() === productId
    );

    if (!productInBranch) {
      throw new AppError("Product not found in branch stock", 404);
    }

    // Validate the new quantity
    if (quantity > productInBranch.quantity) {
      throw new AppError(
        `Cannot add more than ${productInBranch.quantity} units of this product.`,
        400
      );
    }

    // Update the product quantity in the cart
    cart.products[productIndex].quantity = quantity;

    // Save the updated cart
    await cart.save();

    return cart;
  } catch (error) {
    throw new AppError("Error editing product quantity: " + error.message, 500);
  }
};
// Remove product from cart
exports.removeProductFromCart = async (userId, productId) => {
  try {
    const cart = await removeProductFromCart(userId, ONLINE_BRANCH_ID, productId);
    return cart;
  } catch (error) {
    throw new AppError("Error removing product from cart: " + error.message, 500);
  }
};