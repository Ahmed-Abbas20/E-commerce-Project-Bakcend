const express = require("express");
const router = express.Router();
const { AppError } = require("../utils/errorHandler"); 
const checkPermission = require("../middlewares/authorization.middleware");
const {
  createOrUpdateCart,
  getCart,
  deleteCart,
  addProductToCart,
  removeProductFromCart,
  emptyCart
} = require("../services/cart.service");

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


// Get cart by customer ID
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cart = await getCart(userId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Delete cart
// router.delete("/:userId", checkPermission("cart", "delete"), async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     await deleteCart(userId);
//     res.status(204).send();
//   } catch (error) {
//     next(error);
//   }
// });

router.delete("/empty",  async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
      throw new AppError("Customer ID is required", 400);
    }

    const cart = await emptyCart(userId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});
// Add product to cart
router.post("/:userId/add", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId, requiredQty } = req.body;
    const cart = await addProductToCart(userId, productId, requiredQty);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Remove product from cart
router.post("/:userId/remove", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;
    const cart = await removeProductFromCart(userId, productId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

module.exports = router;