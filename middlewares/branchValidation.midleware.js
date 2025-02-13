const Joi = require("joi");
const Product = require("../models/product.model");
const Branch = require("../models/branch.model");
const { AppError } = require("../utils/errorHandler");

// ✅ Validation Schema for Branch
const branchSchema = Joi.object({
  name: Joi.string().trim().required().min(2).max(100),
  location: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  managerId: Joi.string().trim().required(),
  cashierId: Joi.string().trim().required(),
  stock: Joi.array().items(
    Joi.object({
      productId: Joi.string().trim().required(),
      quantity: Joi.number().min(1).required(),
    })
  ),
});

// ✅ Middleware for Creating/Updating Branch Stock
exports.validateBranch = async (req, res, next) => {
  try {
    const { error } = branchSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(new AppError(error.details.map((detail) => detail.message).join("; "), 400));
    }

    const branchId = req.params.branchId; // If updating, branchId will be present
    let existingBranch = null;
    
    if (branchId) {
      existingBranch = await Branch.findById(branchId);
      if (!existingBranch) {
        throw new AppError("Branch not found", 404);
      }
    }

    const stockUpdates = [];

    for (const item of req.body.stock) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product with ID ${item.productId} not found`, 404);
      }

      let oldQuantity = 0;
      
      // If updating, find the old quantity in the branch
      if (existingBranch) {
        const existingStockItem = existingBranch.stock.find(stock => stock.productId.toString() === item.productId);
        oldQuantity = existingStockItem ? existingStockItem.quantity : 0;
      }

      const quantityDifference = item.quantity - oldQuantity; // New stock - Old stock

      if (quantityDifference > 0) {
        // Need to take from main stock
        if (product.mainStock < quantityDifference) {
          throw new AppError(`Not enough stock for product ${product.name}`, 400);
        }
        product.mainStock -= quantityDifference;
      } else if (quantityDifference < 0) {
        // Returning excess stock to main stock
        product.mainStock += Math.abs(quantityDifference);
      }

      stockUpdates.push(product);
    }

    // Save stock updates
    for (const product of stockUpdates) {
      await product.save();
    }

    next();
  } catch (error) {
    next(error);
  }
};
