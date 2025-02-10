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

router.post("/add", checkPermission("cart", "update"), async (req, res, next) => {
  try {
    const { customerId, productId, quantity } = req.body;

    // Validate input
    if (!customerId || !productId || !quantity) {
      throw new AppError("Customer ID, product ID, and quantity are required", 400);
    }

    const cart = await addProductToCart(customerId, productId, quantity);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});


// Get cart by customer ID
router.get("/:customerId", checkPermission("cart", "read"), async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const cart = await getCart(customerId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Delete cart
// router.delete("/:customerId", checkPermission("cart", "delete"), async (req, res, next) => {
//   try {
//     const { customerId } = req.params;
//     await deleteCart(customerId);
//     res.status(204).send();
//   } catch (error) {
//     next(error);
//   }
// });

router.delete("/empty", checkPermission("cart", "delete"), async (req, res, next) => {
  try {
    const { customerId } = req.body;

    // Validate input
    if (!customerId) {
      throw new AppError("Customer ID is required", 400);
    }

    const cart = await emptyCart(customerId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});
// Add product to cart
router.post("/:customerId/add", checkPermission("cart", "update"), async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { productId, requiredQty } = req.body;
    const cart = await addProductToCart(customerId, productId, requiredQty);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Remove product from cart
router.post("/:customerId/remove", checkPermission("cart", "update"), async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { productId } = req.body;
    const cart = await removeProductFromCart(customerId, productId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

module.exports = router;