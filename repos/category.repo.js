const Category = require('../models/category.model');

exports.createCategory = (categoryData) => Category.create(categoryData);
exports.getAllCategories = () => Category.find().sort('-createdAt');
exports.getCategoryById = (id) => Category.findById(id);
exports.getCategoryByName = (name) => Category.findOne({ name });
exports.updateCategory = (id, updateData) => Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
exports.deleteCategory = (id) => Category.findByIdAndDelete(id);
exports.searchCategories = (searchTerm) => Category.find({ name: { $regex: searchTerm, $options: 'i' } });