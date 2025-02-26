const Joi = require("joi");
const Product = require("../models/product.model");
const Branch = require("../models/branch.model");
const { AppError } = require("../utils/errorHandler");

// Validation Schema for Branch Creation
const branchCreationSchema = Joi.object({
  name: Joi.string().trim().required().min(2).max(100),
  location: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  stock: Joi.array().items(
    Joi.object({
      productId: Joi.string().trim().required(),
      quantity: Joi.number().min(1).required(),
    })
  ),
});

// Validation Schema for Branch Update (All fields optional)
const branchUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  location: Joi.string().trim(),
  phone: Joi.string().trim(),
  stock: Joi.array().items(
    Joi.object({
      productId: Joi.string().trim().required(),
      quantity: Joi.number().min(1).required(),
    })
  ),
});

// Middleware for Validating Branch Creation or Update
exports.validateBranch = async (req, res, next) => {
  try {
    const branchId = req.params.branchId;
    let schemaToUse = branchCreationSchema; // Default to creation schema

    // If updating, switch to update schema (allows partial updates)
    if (branchId) {
      schemaToUse = branchUpdateSchema;
    }

    const { error } = schemaToUse.validate(req.body, { abortEarly: false });
    if (error) {
      return next(
        new AppError(
          error.details.map((detail) => detail.message).join("; "),
          400
        )
      );
    }

    let existingBranch = null;

    // If updating, check if the branch exists
    if (branchId) {
      existingBranch = await Branch.findById(branchId);
      if (!existingBranch) {
        throw new AppError("Branch not found", 404);
      }
    }

    // Handle stock updates if stock data is provided
    if (req.body.stock && req.body.stock.length > 0) {
      const productIds = req.body.stock.map((item) => item.productId);

      // Validate product existence
      const products = await Product.find({ _id: { $in: productIds } });
      if (products.length !== productIds.length) {
        const foundProductIds = products.map((product) => product._id.toString());
        const missingProductIds = productIds.filter((id) => !foundProductIds.includes(id));
        throw new AppError(`Products not found: ${missingProductIds.join(", ")}`, 404);
      }

      const stockUpdates = [];

      for (const item of req.body.stock) {
        const product = products.find((p) => p._id.toString() === item.productId);
        let oldQuantity = 0;

        if (existingBranch) {
          const existingStockItem = existingBranch.stock.find(
            (stock) => stock.productId.toString() === item.productId
          );
          oldQuantity = existingStockItem ? existingStockItem.quantity : 0;
        }

        const quantityDifference = item.quantity - oldQuantity;

        // Adjust main stock
        if (quantityDifference > 0) {
          if (product.mainStock < quantityDifference) {
            throw new AppError(`Not enough stock for product ${product.name}`, 400);
          }
          product.mainStock -= quantityDifference;
        } else if (quantityDifference < 0) {
          product.mainStock += Math.abs(quantityDifference);
        }

        stockUpdates.push(product);
      }

      // Save updated products
      await Promise.all(stockUpdates.map((product) => product.save()));
    }

    next();
  } catch (error) {
    next(error);
  }
};
