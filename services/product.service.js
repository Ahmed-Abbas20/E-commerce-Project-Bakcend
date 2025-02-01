const {
    createProduct,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterByPrice,
    getByCategory
  } = require('../repos/product.repo');
  const { getCategoryById } = require('../repos/category.repo');
  
  exports.createProduct = async (productData) => {
    const category = await getCategoryById(productData.categoryId);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return createProduct({ ...productData, categoryName: category.name });
  };
  
  exports.getProduct = async (id) => {
    const product = await getProductById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  };
  
  exports.getAllProducts = getAllProducts;
  
  exports.updateProduct = async (id, updateData) => {
    if (updateData.categoryId) {
      const category = await getCategoryById(updateData.categoryId);
      if (!category) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
      }
      updateData.categoryName = category.name;
    }
    return updateProduct(id, updateData);
  };
  
  exports.deleteProduct = deleteProduct;
  exports.searchProducts = searchProducts;
  exports.filterByPrice = filterByPrice;
  exports.getByCategory = getByCategory;