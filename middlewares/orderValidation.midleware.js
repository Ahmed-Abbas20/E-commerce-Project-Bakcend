const Joi = require("joi");
const { AppError } = require("../utils/errorHandler");
const User = require("../models/base.model");
const Cart = require("../models/cart.model");

// ✅ Joi Schema for Online Order Validation
const onlineOrderSchema = Joi.object({
  orderType: Joi.string().valid("online").required(),
  paymentMethod: Joi.string().valid("Cash", "Card").required(),
  addressIndex: Joi.number().integer().min(0).required(), // ✅ Address index is required
  customerNotes: Joi.string().default(""),
});

// ✅ Joi Schema for Offline Order Validation
const offlineOrderSchema = Joi.object({
  orderType: Joi.string().valid("offline").required(),
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
    // ✅ Validate base order structure
    const { error, value } = onlineOrderSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(new AppError(error.details.map((detail) => detail.message).join("; "), 400));
    }

    const userId = req.user.sub; // Extract user ID from token

    // ✅ Fetch user details for address validation
    const user = await User.findById(userId).select("addresses phone1");
    if (!user || !user.addresses || value.addressIndex >= user.addresses.length) {
      return next(new AppError("Invalid address index or no addresses found", 400));
    }

    // ✅ Attach address & phone to request for later use
    req.body.address = user.addresses[value.addressIndex];
    req.body.phone = user.phone1;

    // ✅ Fetch the cart to check if products exist
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return next(new AppError("Cart is empty", 400));
    }

    // ✅ Attach cart products to request
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
    // ✅ Validate base order structure
    const { error } = offlineOrderSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(new AppError(error.details.map((detail) => detail.message).join("; "), 400));
    }

    next();
  } catch (err) {
    next(new AppError("Error validating offline order: " + err.message, 500));
  }
};
