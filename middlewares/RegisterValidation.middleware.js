const Joi = require("joi");

const userSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Ensures valid email format
    .required(),
  password: Joi.string()
    .min(9) // Minimum 9 characters
    .max(128)
    .pattern(/^(?=.*[A-Z])(?=.*\d).+$/, "password") // At least one uppercase letter & one number
    .required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password")) // Ensures confirmPassword matches password
    .required()
    .messages({ "any.only": "Confirm password must match password" })
    .strip(), // Removes confirmPassword from the validated data
  phone1: Joi.string()
    .pattern(/^(010|011|012|015)\d{8}$/, "Egyptian phone number") // Must start with 010, 011, 012, 015 and have 11 digits
    .required(),
  userType: Joi.string()
    .valid("staff", "customer", "seller")
    .default("customer"),
  role: Joi.when("userType", {
    is: "staff",
    then: Joi.string().valid("super_admin", "clerk", "cashier", "manager").required(),
    otherwise: Joi.forbidden(), // Prevents role if userType is not staff
  }),
  guestCartId:Joi.string().optional()
});

// Middleware for validating user registration
exports.validateUserRegistration = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map(detail => detail.message);
    const err = new Error(messages.join("; "));
    err.statusCode = 400;
    err.details = messages;
    return next(err);
  }
  next();
};
