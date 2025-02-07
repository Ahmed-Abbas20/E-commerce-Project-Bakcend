const Joi = require('joi');
const JoiObjectId = require('joi-objectid')(Joi); // Requires joi-objectid package

const productSchema = Joi.object({
  name: Joi.string().trim().required().min(2).max(100),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().min(0).max(200).required(),
  categoryId: JoiObjectId().required(),
  description: Joi.string().allow(''),
  images: Joi.array().items(Joi.string().uri()),
  sellerId: JoiObjectId()
});

exports.validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const messages = error.details.map(detail => detail.message);
    const err = new Error(messages.join('; '));
    err.statusCode = 400;
    err.details = messages;
    return next(err);
  }
  
  next();
};

