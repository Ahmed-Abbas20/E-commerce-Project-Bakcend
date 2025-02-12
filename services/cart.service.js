const {
  createOrUpdateCart,
  getCartByUserId,
  deleteCart,
  addProductToCart,
  removeProductFromCart,
} = require("../repos/cart.repo");
const { AppError } = require("../utils/errorHandler");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

// Create or update cart
exports.createOrUpdateCart = async (userId, products) => {
  try {
    const cart = await createOrUpdateCart(userId, products);
    return cart;
  } catch (error) {
    throw new AppError("Error creating/updating cart: " + error.message, 500);
  }
};

// Get cart by customer ID
exports.getCart = async (userId) => {
  try {
    // Fetch the cart
    const cart = await getCartByUserId(userId);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    // Array to store changes for products with insufficient stock or unavailability
    const changes = [];

    // Validate each product in the cart
    for (const item of cart.products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        // Product is no longer available
        changes.push({
          productName:product?.name || "Unknown product", // If product is deleted, we don't have a name
          status: "Product no longer available",
        });
      } else if (product.quantity < item.quantity) {
        // Product quantity in stock is less than the quantity in the cart
        changes.push({
          productName: product.name,
          status: `Only ${product.quantity} units available (requested ${item.quantity})`,
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
    await deleteCart(userId);
  } catch (error) {
    throw new AppError("Error deleting cart: " + error.message, 500);
  }
};
exports.emptyCart = async (userId) => {
  try {
    // Find the customer's cart
    const cart = await Cart.findOne({ userId });
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
    // Validate product availability
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Find the customer's cart
    const cart = await Cart.findOne({ userId });
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
    if (totalQuantity > product.quantity) {
      throw new AppError(
        `Cannot add more than ${product.quantity} units of this product. You already have ${cart.products[productIndex]?.quantity || 0} units in your cart.`,
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

// Remove product from cart
exports.removeProductFromCart = async (userId, productId) => {
  try {
    const cart = await removeProductFromCart(userId, productId);
    return cart;
  } catch (error) {
    throw new AppError("Error removing product from cart: " + error.message, 500);
  }
};