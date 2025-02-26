const Joi = require("joi");
const { AppError } = require("../utils/errorHandler");

const userSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string()
    .min(9)
    .max(128)
    .pattern(/^(?=.*[A-Z])(?=.*\d).+$/, "password") // At least one uppercase letter & one number
    .required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Confirm password must match password" })
    .strip(),
  phone1: Joi.string()
    .pattern(/^(010|011|012|015)\d{8}$/, "Egyptian phone number")
    .required(),
    // terms: Joi.boolean()
    // .valid(true)
    // .required()
    // .messages({
    //   'any.only': 'You must accept the terms and conditions',
    //   'any.required': 'Terms acceptance is required'
    // }),
  userType: Joi.string().valid("staff", "customer", "seller").default("customer"),

  // Staff-specific validation
  role: Joi.when("userType", {
    is: "staff",
    then: Joi.string().valid("super_admin", "cashier", "manager").required(),
    otherwise: Joi.forbidden(),
  }),
  branchId: Joi.when("userType", {
    is: "staff",
    then: Joi.string()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/, "valid ObjectId") 
      .optional(),
    otherwise: Joi.forbidden(),
  }),
  staffSSN: Joi.when("userType", {
    is: "staff",
    then: Joi.string().trim().required(),
    otherwise: Joi.forbidden(),
  }),

  // Seller-specific validation
  companyName: Joi.when("userType", {
    is: "seller",
    then: Joi.string().trim().required(),
    otherwise: Joi.forbidden(),
  }),
  companyRegistrationNumber: Joi.when("userType", {
    is: "seller",
    then: Joi.string().trim().required(),
    otherwise: Joi.forbidden(),
  }),
  SSN: Joi.when("userType", {
    is: "seller",
    then: Joi.string().trim().required(),
    otherwise: Joi.forbidden(),
  }),
  cart: Joi.object({
    products: Joi.array().items(
      Joi.object({
        productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/, "valid ObjectId").required(),
        quantity: Joi.number().min(1).required(),
      })
    ).optional(),
  }).optional(),
});

// Middleware for validating user registration
exports.validateUserRegistration = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return next(new AppError(error.details.map(detail => detail.message).join("; "), 400));
  }
  next();
};
