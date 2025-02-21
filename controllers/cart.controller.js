const express = require("express");
const router = express.Router();
const { AppError } = require("../utils/errorHandler");
const {
  getCart,
  addProductToCart,
  removeProductFromCart,
  emptyCart,
  editProductQuantity
} = require("../services/cart.service");

// Add product to cart
router.post("/add", async (req, res, next) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Validate input
    if (!userId || !productId || !quantity) {
      throw new AppError("User ID, product ID, and quantity are required", 400);
    }

    const cart = await addProductToCart(userId, productId, quantity);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Edit product quantity in cart
router.post("/:userId/edit", async (req, res, next) => {
  try {
    const { userId } = req.params; // Get userId from URL
    const { productId, quantity } = req.body; // Get productId and new quantity from body

    // Validate input
    if (!productId || !quantity) {
      throw new AppError("Product ID and quantity are required", 400);
    }

    // Call the service to update the product quantity
    const cart = await editProductQuantity(userId, productId, quantity);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Get cart by user ID
router.get("/", async (req, res, next) => {
  try {
    const { userId } = req.query;

    // Validate input
    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    const { cart, changes } = await getCart(userId);
    res.status(200).json({ success: true, data: { cart, changes } });
  } catch (error) {
    next(error);
  }
});

// Empty cart
router.delete("/empty", async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    const cart = await emptyCart(userId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Add product to cart (alternative endpoint)
// router.post("/:userId/add", async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     const { productId, requiredQty } = req.body;

//     // Validate input
//     if (!productId || !requiredQty) {
//       throw new AppError("Product ID and quantity are required", 400);
//     }

//     const cart = await addProductToCart(userId, productId, requiredQty);
//     res.status(200).json({ success: true, data: cart });
//   } catch (error) {
//     next(error);
//   }
// });

// Remove product from cart
router.post("/:userId/remove", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    // Validate input
    if (!productId) {
      throw new AppError("Product ID is required", 400);
    }

    const cart = await removeProductFromCart(userId, productId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

module.exports = router;