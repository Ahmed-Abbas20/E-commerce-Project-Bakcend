const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().trim().required().min(2).max(50)
});

exports.validateCategory = (req, res, next) => {
  const { error } = categorySchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    return next(err);
  }
  next();
};

exports.validateCategoryId = (req, res, next) => {
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