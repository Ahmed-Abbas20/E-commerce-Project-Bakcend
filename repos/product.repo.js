const Product = require('../models/product.model');
exports.filterProducts = (query, page = 1) =>  Product.find(query).skip((page - 1) *20).limit(20);
exports.createProduct = (productData) => Product.create(productData);
exports.getProductById = (_id) => Product.findById(_id);
exports.getAllProducts = (page = 1, filters = {}) =>Product.find(filters).sort('-createdAt').skip((page - 1) * 20).limit(20);


exports.updateProduct = (id, updateData) =>Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

exports.deleteProduct = (id) => Product.findByIdAndDelete(id);

exports.searchProducts = (searchTerm) =>
  Product.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  });

