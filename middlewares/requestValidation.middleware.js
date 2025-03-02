const Joi = require("joi");
const { AppError } = require("../utils/errorHandler");
const Product = require("../models/product.model");
const Branch = require("../models/branch.model");
const requestRepo = require("../repos/request.repo");

// Joi Schema for Request Validation
const requestSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().trim().required(),
        requestedQty: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

// Middleware to Validate and Check Data
exports.validateRequestData = async (req, res, next) => {
  try {
    const { error } = requestSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(new AppError(error.details.map((d) => d.message).join("; "), 400));
    }

    const { products } = req.body;
    const managerId = req.user.sub;
    const branchId = req.user.branchId;

    if (!branchId) {
      return next(new AppError("Manager does not belong to any branch.", 400));
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return next(new AppError("Branch not found.", 404));
    }

    const validatedProducts = [];
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return next(new AppError(`Product not found: ${item.productId}`, 404));
      }

      validatedProducts.push({
        productId: item.productId,
        requestedQty: item.requestedQty,
      });
    }

    const existingRequest = await requestRepo.findExistingRequest(managerId, validatedProducts);
    if (existingRequest) {
      return next(new AppError("You have already requested these products. Please wait for approval.", 409));
    }

    req.validatedRequest = { managerId, branchId, products: validatedProducts };
    next();
  } catch (error) {
    next(error);
  }
};
