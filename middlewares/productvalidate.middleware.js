const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().trim().required().min(2).max(100),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().min(0).required(),
  categoryId: Joi.string().required(),
  description: Joi.string().allow(''),
  images: Joi.array().items(Joi.string()),
  sellerId: Joi.string()
});

exports.validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    return next(err);
  }
  next();
};



exports.validateProductId = (req, res, next) => {
  const schema = Joi.string().guid({
    version: ['uuidv4'],
    separator: '-'
  }).required();

  const { error } = schema.validate(req.params.id);
  
  if (error) {
    error.statusCode = 400;
    return next(error);
  }
  
  next();
};