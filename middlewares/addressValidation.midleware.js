
const Joi = require("joi");
const { AppError } = require("../utils/errorHandler");
const addressSchema = Joi.object({
    city: Joi.string().trim().min(2).max(100).required(),
    street: Joi.string().trim().min(2).max(255).required(),
    gov: Joi.string().trim().min(2).max(100).required(), 
    zipCode: Joi.string()
      .trim()
      .pattern(/^\d{4,10}$/, "valid zip code") 
      .required(),
  });

exports.validateAddress = (req, res, next) => {
    const { error } = addressSchema.validate(req.body, { abortEarly: false });
  
    if (error) {
      return next(new AppError(error.details.map((detail) => detail.message).join("; "), 400));
    }
    next();
  };
    