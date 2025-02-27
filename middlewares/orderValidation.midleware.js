const Joi = require("joi");
const { AppError } = require("../utils/errorHandler");
const Cart = require("../models/cart.model");

const validStatuses = ["pending", "onTheWay", "delivered", "cancelled"];
const onlineOrderSchema = Joi.object({
  paymentMethod: Joi.string().valid("Cash", "Card").required(),
  addressIndex: Joi.number().integer().min(0).required(), 
  customerNotes: Joi.string().default(""),
  status: Joi.string().valid(...validStatuses).default("pending"),
});


const offlineOrderSchema = Joi.object({
  paymentMethod: Joi.string().valid("Cash", "Card").required(),
  customerName: Joi.string().trim().min(2).max(50).required(),
  phone: Joi.string().trim().min(10).max(15).required(),
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        requiredQty: Joi.number().integer().positive().required(),
      })
    )
    .min(1)
    .required()
});

// Generic Validator Function
const validateSchema = (schema, orderType) => async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      return next(new AppError(error.details.map((detail) => detail.message).join("; "), 400));
    }

    req.body = { ...value, orderType }; 
    next();
  } catch (err) {
    next(new AppError(`Error validating ${orderType} order: ${err.message}`, 500));
  }
};

// Middleware for Online Order Validation (Includes Cart Check)
exports.validateOnlineOrder = async (req, res, next) => {
  try {
    const { error, value } = onlineOrderSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return next(new AppError(error.details.map((detail) => detail.message).join("; "), 400));
    }

    const userId = req.user.sub; 
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart || cart.products.length === 0) {
      return next(new AppError("Cart is empty", 400));
    }

    req.body = {
      ...value,
      orderType: "online",
      products: cart.products.map((item) => ({
        productId: item.productId._id,
        requiredQty: item.quantity,
      }))
    };

    next();
  } catch (err) {
    next(new AppError("Error validating online order: " + err.message, 500));
  }
};




const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "onTheWay", "delivered")
    .required(), 
}).required(); 

exports.validateStatusUpdate = async (req, res, next) => {
  try {
    const { error, value } = statusUpdateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return next(new AppError(error.details.map((detail) => detail.message).join("; "), 400));
    }

    req.body = value;
    next();
  } catch (err) {
    next(new AppError(`Error validating order status update: ${err.message}`, 500));
  }
};



// Middleware for Offline Order Validation
exports.validateOfflineOrder = validateSchema(offlineOrderSchema, "offline");
