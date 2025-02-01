const { createCategory,getAllCategories,getCategoryById,getCategoryByName, updateCategory,deleteCategory,searchCategories } = require('../repos/category.repo');
  
  exports.createCategory = async (categoryData) => {
    const exists = await getCategoryByName(categoryData.name);
    if (exists) {
      const error = new Error('Category already exists');
      error.statusCode = 409;
      throw error;
    }
    return createCategory(categoryData);
  };
  
  exports.getAllCategories = getAllCategories;
  
  exports.getCategory = async (id) => {
    const category = await getCategoryById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  };
  
  exports.updateCategory = async (id, updateData) => {
    if (updateData.name) {
      const exists = await getCategoryByName(updateData.name);
      if (exists && exists.id !== id) {
        const error = new Error('Category name exists');
        error.statusCode = 409;
        throw error;
      }
    }
    return updateCategory(id, updateData);
  };
  
  exports.deleteCategory = deleteCategory;
  exports.searchCategories = searchCategories;