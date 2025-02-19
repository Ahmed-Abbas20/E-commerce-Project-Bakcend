const express = require("express");
const router = express.Router();
const { 
  addProductToOrder, 
  createOnlineOrder, 
  createOfflineOrder 
} = require("../repos/order.repo");
const { validateOnlineOrder, validateOfflineOrder } = require("../middlewares/orderValidation.midleware"); 
const { getCart } = require("../services/cart.service");
const { getCustomerAddresses } = require("../repos/customer.repo");
const { AppError } = require("../utils/errorHandler");

// Check product availability in Branch
router.post("/add-product", async (req, res, next) => {
    try {
      const userId = req.user.sub; 
      const { productId } = req.body;
      
      if (!productId) throw new AppError("Product ID is required", 400);
  
      const product = await addProductToOrder(userId, productId); 
  
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  });
  

// Create Online Order (Uses Cart Data)
router.post("/online", validateOnlineOrder, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { addressIndex, paymentMethod, customerNotes,products } = req.body;

    const result = await createOnlineOrder(userId, addressIndex, paymentMethod, customerNotes,products);

    if (!result.success) return res.status(400).json({ success: false, message: result.message });

    res.status(201).json({ success: true, data: result.order });
  } catch (error) {
    next(error);
  }
});

// Create Offline Order (Manual Entry)
router.post("/offline", validateOfflineOrder, async (req, res, next) => {
  try {
    const cashierId = req.user.sub;
    const { customerName, phone, paymentMethod, products } = req.body;

    const result = await createOfflineOrder(cashierId, customerName, phone, paymentMethod, products);

    if (!result.success) return res.status(400).json({ success: false, message: result.message });

    res.status(201).json({ success: true, data: result.order });
  } catch (error) {
    next(error);
  }
});

// Checkout - Fetch Cart & Customer Addresses
router.get("/checkout", async (req, res, next) => {
  try {
    const userId = req.user.sub;
    if (!userId) throw new AppError("User ID is required", 400);

    const { cart, changes } = await getCart(userId);
    const addresses = await getCustomerAddresses(userId);

    res.status(200).json({ success: true, data: { cart, changes, addresses } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
