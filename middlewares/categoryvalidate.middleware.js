const Joi = require('joi');
const JoiObjectId = require('joi-objectid')(Joi); 

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
  const schema = JoiObjectId().required();

  const { error } = schema.validate(req.params.id);
  
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    return next(err);
  }
  
  next();
};