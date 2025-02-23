const { AppError } = require("../utils/errorHandler");
const Cart = require("../models/cart.model");
const Branch = require("../models/branch.model");
const User = require("../models/base.model");

const getBranchByName = async (branchName) => {
  const branch = await Branch.findOne({ name: branchName });
  if (!branch) {
    throw new AppError(`Branch with name "${branchName}" not found`, 404);
  }
  return branch;
};

exports.addProductToCart = async (userId, productId, quantity) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (!user.isActive) {
      throw new AppError("This account has been deactivated", 403);
    }

    const branch = await getBranchByName("Website Branch");

    // Check if the product exists in the branch stock
    const productInBranch = branch.stock.find(
      (item) => item.productId.toString() === productId
    );
    if (!productInBranch) {
      throw new AppError("Product not found in branch stock", 404);
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    // Check if the product is already in the cart
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    let totalQuantity = quantity;

    if (productIndex > -1) {
      totalQuantity += cart.products[productIndex].quantity;
    }

    if (totalQuantity > productInBranch.quantity) {
      throw new AppError(
        `Cannot add more than ${productInBranch.quantity} units of this product. You already have ${cart.products[productIndex]?.quantity || 0} units in your cart.`,
        400
      );
    }

    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    await cart.save();

    return cart;
  } catch (error) {
    throw new AppError("Error adding product to cart: " + error.message, 500);
  }
};

exports.editProductQuantity = async (userId, productId, quantity) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (!user.isActive) {
      throw new AppError("This account has been deactivated", 403);
    }

    const branch = await getBranchByName("Website Branch");

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

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

    if (quantity > productInBranch.quantity) {
      throw new AppError(
        `Cannot add more than ${productInBranch.quantity} units of this product.`,
        400
      );
    }

    cart.products[productIndex].quantity = quantity;

    await cart.save();

    return cart;
  } catch (error) {
    throw new AppError("Error editing product quantity: " + error.message, 500);
  }
};

exports.removeProductFromCart = async (userId, productId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (!user.isActive) {
      throw new AppError("This account has been deactivated", 403);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }
    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    return cart;
  } catch (error) {
    throw new AppError("Error removing product from cart: " + error.message, 500);
  }
};

exports.emptyCart = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (!user.isActive) {
      throw new AppError("This account has been deactivated", 403);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }
    cart.products = [];
    await cart.save();

    return cart;
  } catch (error) {
    throw new AppError("Error emptying cart: " + error.message, 500);
  }
};

exports.getCart = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (!user.isActive) {
      throw new AppError("This account has been deactivated", 403);
    }
    const branch = await getBranchByName("Website Branch");

    let cart = await Cart.findOne({ userId }).populate({
      path: "products.productId",
      select: "name costPrice soldPrice images description mainStock categoryId categoryName sellerId createdAt updatedAt", // Include all fields from the Product schema
      transform: (product) => {
        if (product.images) {
          product.images = product.images.map((img) => ({
            filePath: `${process.env.IMAGEKIT_ENDPOINT_URL}${img.filePath}`,
          }));
        }
        return product;
      },
    });
    if (!cart) {
      cart = new Cart({ userId, products: [] });
      await cart.save();
    }

    const changes = [];

    // Validate each product in the cart
    for (const item of cart.products) {
      const productInBranch = branch.stock.find(
        (stockItem) => stockItem.productId.toString() === item.productId._id.toString()
      );

      if (!productInBranch) {
        changes.push({
          productName: item.productId.name || "Unknown product",
          status: "Product no longer available in branch stock",
        });
      } else if (productInBranch.quantity < item.quantity) {
        changes.push({
          productName: item.productId.name,
          status: `Only ${productInBranch.quantity} units available in branch stock (requested ${item.quantity})`,
        });
      }
    }
    return { cart, changes };
  } catch (error) {
    throw new AppError("Error fetching cart: " + error.message, 500);
  }
};