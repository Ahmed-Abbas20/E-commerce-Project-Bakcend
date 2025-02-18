const { AppError } = require("../utils/errorHandler");
const Cart = require("../models/cart.model");
const Branch = require("../models/branch.model");

// Helper function to get the branch by name
const getBranchByName = async (branchName) => {
  const branch = await Branch.findOne({ name: branchName });
  if (!branch) {
    throw new AppError(`Branch with name "${branchName}" not found`, 404);
  }
  return branch;
};

// Add product to cart
exports.addProductToCart = async (userId, productId, quantity) => {
  try {
    // Fetch the branch by name
    const branch = await getBranchByName("Website Branch");

    // Check if the product exists in the branch stock
    const productInBranch = branch.stock.find(
      (item) => item.productId.toString() === productId
    );
    if (!productInBranch) {
      throw new AppError("Product not found in branch stock", 404);
    }

    // Find the customer's cart
    let cart = await Cart.findOne({ userId, branchId: branch._id });
    if (!cart) {
      // If the cart doesn't exist, create a new one
      cart = new Cart({ userId, branchId: branch._id, products: [] });
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

// Edit product quantity in cart
exports.editProductQuantity = async (userId, productId, quantity) => {
  try {
    // Fetch the branch by name
    const branch = await getBranchByName("Website Branch");

    // Find the cart for the user and branch
    const cart = await Cart.findOne({ userId, branchId: branch._id });
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

    // Fetch the product in the branch stock
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
    throw new AppError("Error emptying cart: " + error.message, 500);
  }
};

// Remove product from cart
exports.removeProductFromCart = async (userId, productId) => {
  try {
    // Fetch the branch by name
    const branch = await getBranchByName("Website Branch");

    // Find the cart for the user and branch
    const cart = await Cart.findOne({ userId, branchId: branch._id });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    // Remove the product from the cart
    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );

    // Save the updated cart
    await cart.save();

    return cart;
  } catch (error) {
    throw new AppError("Error removing product from cart: " + error.message, 500);
  }
};
// Empty the cart (remove all products)
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
// Get cart by user ID
exports.getCart = async (userId) => {
  try {
    // Fetch the branch by name
    const branch = await getBranchByName("Website Branch");

    // Fetch the cart for the user and branch
    let cart = await Cart.findOne({ userId, branchId: branch._id });

    // If the cart doesn't exist, create a new one
    if (!cart) {
      cart = new Cart({ userId, branchId: branch._id, products: [] });
      await cart.save();
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