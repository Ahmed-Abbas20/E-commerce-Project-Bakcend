const express = require("express");
const router = express.Router();
const { addProductToOrder,createOnlineOrder, createOfflineOrder } = require("../repos/order.repo");
const { AppError } = require("../utils/errorHandler");
const {  validateOnlineOrder, validateOfflineOrder } = require("../middlewares/orderValidation.midleware"); 
const { getCart } = require("../services/cart.service");
const { getCustomerAddresses } = require("../repos/customer.repo");
// ✅ Route to check product availability in "Website Branch"
router.post("/add-product", async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      throw new AppError("Product ID is required", 400);
    }

    const product = await addProductToOrder(productId);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});









// ✅ Create Online Order (Uses Cart Data)
router.post("/online", validateOnlineOrder, async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const { address, phone, paymentMethod, customerNotes, products } = req.body;

        const result = await createOnlineOrder(userId, address, phone, paymentMethod, customerNotes, products);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message, changes: result.changes });
        }

        res.status(201).json({ success: true, data: result.order });
    } catch (error) {
        next(error);
    }
});

// ✅ Create Offline Order (Manual Entry)
router.post("/offline", validateOfflineOrder, async (req, res, next) => {
    try {
        const cashierId = req.user.sub; // Extract cashier ID from token
        const { customerName, phone, paymentMethod, products } = req.body;

        const result = await createOfflineOrder(cashierId, customerName, phone, paymentMethod, products);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message, changes: result.changes });
        }

        res.status(201).json({ success: true, data: result.order });
    } catch (error) {
        next(error);
    }
});





  
  // ✅ Route to navigate to checkout page
router.get("/checkout", async (req, res, next) => {
    try {
      const userId = req.user.sub;
      if (!userId) {
        throw new AppError("User ID is required", 400);
      }
  
      // Get cart details
      const { cart, changes } = await getCart(userId);
  
      // Get customer addresses
      const addresses = await getCustomerAddresses(userId);
  
      res.status(200).json({
        success: true,
        data: {
          cart,
          changes,
          addresses,
        },
      });
    } catch (error) {
      next(error);
    }
  });
  
  module.exports = router;
  


