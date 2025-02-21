const express = require("express");
const router = express.Router();
const { 
  addProductToOrder, 
  createOnlineOrder, 
  createOfflineOrder,
  getCustomerOrders,
  getOnlineCustomerOrders,
  getSellerOrders,
  getBranchOrders,
  updateOrder,
  getAllOrders,
  getOrderById,
  cancelOrder
} = require("../repos/order.repo");
const { validateOnlineOrder, validateOfflineOrder } = require("../middlewares/orderValidation.midleware"); 
const { getCart } = require("../services/cart.service");
const { getCustomerAddresses } = require("../repos/customer.repo");
const { AppError } = require("../utils/errorHandler");
const Order = require("../models/order.model"); 
const checkPermission = require("../middlewares/authorization.middleware"); 
// Check product availability in Branch
router.post("/add-product",checkPermission("order","addProduct"), async (req, res, next) => {
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
router.post("/offline",checkPermission("order","createOfflineOrder"), validateOfflineOrder, async (req, res, next) => {
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

// Get Customer Orders by Customer ID (from params)
router.get("/customer/:customerId",checkPermission("order","getCustomerOrdersByCustomerId"), async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const orders = await getCustomerOrders(customerId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get Customer Orders by Customer ID (from token)
router.get("/customer/my/orders", async (req, res, next) => {
  try {
    const customerId = req.user.sub; 
    const orders = await getOnlineCustomerOrders(customerId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get Seller Orders by Seller ID (from token)
router.get("/seller/my/orders", async (req, res, next) => {
  try {
    const sellerId = req.user.sub; // Extract from token
    const orders = await getSellerOrders(sellerId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get Seller Orders by Seller ID (from params)
router.get("/seller/:sellerId/orders",checkPermission("order","getSellerOrdersBySellerId"), async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const orders = await getSellerOrders(sellerId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get Orders of the Branch (from token)
router.get("/branch/my/orders", async (req, res, next) => {
  try {
    const branchId = req.user.branchId; // Extract from token
    const orders = await getBranchOrders(branchId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Update Order Status (also update related Seller Orders)
router.put("/:orderId",checkPermission("order","updateOrderById"), async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const updatedData = req.body;
    const { role: userRole, branchId: userBranchId } = req.user; 

   
    if (userRole === "manager") {
      const order = await getOrderById(orderId);

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      if (order.branchId.toString() !== userBranchId) {
        throw new AppError("You are not authorized to update this order", 403);
      }
    }

    const updatedOrder = await updateOrder(orderId, updatedData);
    res.status(200).json({ success: true, data: updatedOrder });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});


// Cancel Order (also cancel related Seller Orders)
router.put("/:orderId/cancel", checkPermission("order","cancelOrderById"),async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const cancelledOrder = await cancelOrder(orderId);
    res.status(200).json({ success: true, data: cancelledOrder });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});


// Get All Orderss
router.get("/", checkPermission("order","getAll"),async (req, res, next) => {
  try {
    const orders = await getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});


module.exports = router;
