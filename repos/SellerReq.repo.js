const SellerReq=require('./../models/SellerRequest.model');

exports.createProduct = (productData) => Product.create(productData);
exports.updateProduct = (id, updateData) =>Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
exports.deleteProduct = (id) => Product.findByIdAndDelete(id);
