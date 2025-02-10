const Joi = require('joi');
const { AppError } = require('../utils/errorHandler');

// Schema for Creating a Product (POST)
const createProductSchema = Joi.object({
  name: Joi.string().trim().required().min(2).max(100),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().min(0).required(),
  categoryId: Joi.string().required(),
  description: Joi.string().allow(''),
  images: Joi.array().items(Joi.string()),
  sellerId: Joi.string().required()
});

// Schema for Updating a Product (PUT)
const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100), // Optional in update
  price: Joi.number().min(0),
  quantity: Joi.number().min(0),
  categoryId: Joi.string(),
  description: Joi.string().allow(''),
  images: Joi.array().items(Joi.string()), // New images to be uploaded
  imagesToRemove: Joi.alternatives().try( // Accept array or convert string to array
    Joi.array().items(Joi.string()),
    Joi.string().custom((value) => {
      try {
        return JSON.parse(value); // Convert stringified array to real array
      } catch (error) {
        throw new Error("imagesToRemove must be a valid array");
      }
    })
  ).optional(),
  sellerId: Joi.string()
});

/**
 * Middleware to Validate Product Data
 * - Uses `createProductSchema` for `POST`
 * - Uses `updateProductSchema` for `PUT`
 */
exports.validateProduct = (req, res, next) => {
  const schema = req.method === 'POST' ? createProductSchema : updateProductSchema;

  // Ensure imagesToRemove is properly parsed into an array if it's sent as a string
  if (typeof req.body.imagesToRemove === "string") {
    try {
      req.body.imagesToRemove = JSON.parse(req.body.imagesToRemove);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid format: imagesToRemove must be an array",
      });
    }
  }

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};




exports.validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));
  next();
};

exports.productRequestSchema = Joi.object({
  operationType: Joi.string().valid('create', 'update', 'delete').required(),
  productData: Joi.when('operationType', {
    is: Joi.valid('create', 'update'),
    then: Joi.object({
      name: Joi.string().required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().min(0).required(),
      categoryId: Joi.string().required(),
      description: Joi.string().allow(''),
      images: Joi.array().items(Joi.object({
        fileId: Joi.string().required(),
        filePath: Joi.string().required()
      }))
    }).required(),
    otherwise: Joi.forbidden()
  }),
  productId: Joi.when('operationType', {
    is: Joi.valid('update', 'delete'),
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  })
});

