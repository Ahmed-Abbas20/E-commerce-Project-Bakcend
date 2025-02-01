const { createProduct, getProductById, getAllProducts, updateProduct, deleteProduct, searchProducts, filterByPrice, getByCategory } = require('../repos/product.repo');
const { getCategoryById } = require('../repos/category.repo');
const Product = require('../models/product.model'); 
const {AppError} = require('../utils/errorHandler'); 

exports.createProduct = async (productData) => {
  // 1. Validate category exists
  const category = await getCategoryById(productData.categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);  
  }

  // 2. Check for existing product WITH SAME NAME AND SELLER
  const existingProduct = await Product.findOne({
    name: productData.name.trim(),
    sellerId: productData.sellerId 
  });

  if (existingProduct) {
    throw new AppError('You already have a product with this name', 409);  
  }

  // 3. Create product with trimmed name and category name
  return createProduct({
    ...productData,
    name: productData.name.trim(),
    categoryName: category.name
  });
};

exports.getProduct = async (id) => {
  const product = await getProductById(id);
  if (!product) {
    throw new AppError('Product not found', 404); 
  }
  return product;
};

exports.getAllProducts = getAllProducts;

exports.updateProduct = async (id, updateData) => {
  if (updateData.categoryId) {
    const category = await getCategoryById(updateData.categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    updateData.categoryName = category.name;
  }
  return updateProduct(id, updateData);
};

exports.deleteProduct = deleteProduct;
exports.searchProducts = searchProducts;
exports.filterByPrice = filterByPrice;
exports.getByCategory = getByCategory;
