const Joi = require("joi");
const { AppError } = require("../utils/errorHandler");
const User = require("../models/base.model");
const Cart = require("../models/cart.model");

// ✅ Joi Schema for Online Order Validation
const onlineOrderSchema = Joi.object({
    paymentMethod: Joi.string().valid("Cash", "Card").required(),
    addressIndex: Joi.number().integer().min(0).required(), // ✅ Address index is required
    customerNotes: Joi.string().default(""),
  });
  
// ✅ Joi Schema for Offline Order Validation
const offlineOrderSchema = Joi.object({
    paymentMethod: Joi.string().valid("Cash", "Card").required(),
    customerName: Joi.string().trim().min(2).max(50).required(), // ✅ Customer name is required
    phone: Joi.string().trim().min(10).max(15).required(), // ✅ Phone number is required
    products: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          requiredQty: Joi.number().integer().positive().required(),
        })
      )
      .min(1)
      .required(), // ✅ At least one product required
  });
  

// ✅ Middleware for Online Order Validation
exports.validateOnlineOrder = async (req, res, next) => {
    try {
        // ✅ Validate request without orderType
        const { error, value } = onlineOrderSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            return next(new AppError(error.details.map((detail) => detail.message).join("; "), 400));
        }

        const userId = req.user.sub; // Extract user ID from token

        // ✅ Fetch the cart to check if products exist
        const cart = await Cart.findOne({ userId }).populate("products.productId");
        if (!cart || cart.products.length === 0) {
            return next(new AppError("Cart is empty", 400));
        }

        // ✅ Assign `orderType: "online"` automatically
        req.body.orderType = "online"; 
        req.body.addressIndex = value.addressIndex;
        req.body.paymentMethod = value.paymentMethod;
        req.body.customerNotes = value.customerNotes || "";
        req.body.products = cart.products.map((item) => ({
            productId: item.productId._id,
            requiredQty: item.quantity,
        }));

        next();
    } catch (err) {
        next(new AppError("Error validating online order: " + err.message, 500));
    }
};


// ✅ Middleware for Offline Order Validation
exports.validateOfflineOrder = async (req, res, next) => {
    try {
        // ✅ Validate request without orderType
        const { error, value } = offlineOrderSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            return next(new AppError(error.details.map((detail) => detail.message).join("; "), 400));
        }

        // ✅ Assign `orderType: "offline"` automatically
        req.body.orderType = "offline"; 
        req.body.paymentMethod = value.paymentMethod;
        req.body.customerName = value.customerName;
        req.body.phone = value.phone;
        req.body.products = value.products;

        next();
    } catch (err) {
        next(new AppError("Error validating offline order: " + err.message, 500));
    }
};

