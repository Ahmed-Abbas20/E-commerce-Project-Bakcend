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

router.post("/add", async (req, res, next) => {
  try {
    const userId=req.user.sub;
    const { productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      throw new AppError("User ID, product ID, and quantity are required", 400);
    }

    const cart = await addProductToCart(userId, productId, quantity);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

router.post("/edit", async (req, res, next) => {
  try {
    const  userId = req.user.sub;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      throw new AppError("Product ID and quantity are required", 400);
    }

    const cart = await editProductQuantity(userId, productId, quantity);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const userId  = req.user.sub;

    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    const { cart, changes } = await getCart(userId);
    res.status(200).json({ success: true, data: { cart, changes } });
  } catch (error) {
    next(error);
  }
});

router.delete("/empty", async (req, res, next) => {
  try {
    const userId  = req.user.sub;

    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    const cart = await emptyCart(userId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

router.post("/remove", async (req, res, next) => {
  try {
    const userId  = req.user.sub;
    const { productId } = req.body;

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