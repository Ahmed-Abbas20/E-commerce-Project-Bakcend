const { createCategory, getAllCategories, getCategoryById, getCategoryByName, updateCategory, deleteCategory, searchCategories } = require('../repos/category.repo');
const {AppError} = require("../utils/errorHandler");  

exports.createCategory = async (categoryData) => {
  const exists = await getCategoryByName(categoryData.name);
  if (exists) {
    throw new AppError('Category already exists', 409);  
  }
  return createCategory(categoryData);
};

exports.getAllCategories = getAllCategories;

exports.getCategory = async (id) => {
  const category = await getCategoryById(id);
  if (!category) {
    throw new AppError('Category not found', 404);  
  }
  return category;
};

exports.updateCategory = async (id, updateData) => {
  if (updateData.name) {
    const exists = await getCategoryByName(updateData.name);
    if (exists && exists.id !== id) {
      throw new AppError('Category name exists', 409);  
    }
  }
  return updateCategory(id, updateData);
};

exports.deleteCategory = deleteCategory;

exports.searchCategories = searchCategories;
