const { createProduct, getProductById, getAllProducts, updateProduct, deleteProduct, searchProducts,filterProducts } = require('../repos/product.repo');
const { getCategoryById } = require('../repos/category.repo');
const Product = require('../models/product.model'); 
const {AppError} = require('../utils/errorHandler'); 
const { deleteProductImages} = require("./media.service");
const { handleImageUpload } = require("./upload.service");
const BASE_IMAGE_URL = "https://ik.imagekit.io/cwe4zwtml/";
const { APP_CONFIG } = require("../config/app.config");
const ImageKit = require("imagekit");
const {
  IMAGEKIT_ENDPOINT_URL,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
} = APP_CONFIG;

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_ENDPOINT_URL,
});



exports.createProductService = async (productData, uploadedFiles = []) => {
 
  const category = await getCategoryById(productData.categoryId);
  if (!category) throw new AppError("Category not found", 404);


 
  const existingProduct = await Product.findOne({
    name: productData.name.trim(),
    sellerId: productData.sellerId,
  });
  
  if (existingProduct) throw new AppError("You already have a product with this name", 409);
  

 
  const product = await createProduct({
    ...productData,
    name: productData.name.trim(),
    categoryName: category.name,
  });

 
  if (uploadedFiles.length > 0) {
    const uploadedImages = await handleImageUpload(Product, product._id, uploadedFiles);
    product.images = uploadedImages;
    await product.save();
  }

  return product;
};

exports.getProduct = async (id) => {
  const product = await getProductById(id);
  if (!product) {
    throw new AppError('Product not found', 404); 
  }
  return product;
};

exports.getAllProducts = getAllProducts;

exports.updateProduct = async (id, updateData, uploadedFiles = [], imagesToRemove = []) => {
  try {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      throw new AppError("Product not found", 404);
    }

   
    const imageFileIdsToRemove = imagesToRemove.filter(fileId =>
      existingProduct.images.some(img => img.fileId === fileId)
    );

    if (imageFileIdsToRemove.length > 0) {
      await deleteProductImages(imageFileIdsToRemove);

      
      existingProduct.images = existingProduct.images.filter(img => 
        !imageFileIdsToRemove.includes(img.fileId)
      );
      await existingProduct.save();
    }

   
    if (uploadedFiles.length > 0) {
      const uploadedImages = await handleImageUpload(Product, id, uploadedFiles);
      existingProduct.images.push(...uploadedImages);
      await existingProduct.save();
    }

    Object.assign(existingProduct, updateData);
    await existingProduct.save();

    return await Product.findById(id);

  } catch (error) {
    throw new AppError(error.message || "Failed to update product", 500);
  }
};








exports.deleteProduct = deleteProduct;
exports.searchProducts = searchProducts;
exports.filterProductsServiceS = async (categoryId = null, min = null, max = null, page = 1, additionalFilters = {}) => {
  try {
    const query = { ...additionalFilters };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (min !== null || max !== null) {
      query.soldPrice = {};
      if (min !== null) query.soldPrice.$gte = min;
      if (max !== null) query.soldPrice.$lte = max;
    }

    const products = await Product.find(query)
      .sort('-createdAt')
      .skip((page - 1) * 20)
      .limit(20);

    return products.map(product => ({
      ...product.toObject(),
      images: product.images.map(img => ({
        fileId: img.fileId,
        filePath: `${BASE_IMAGE_URL}${img.filePath}`
      }))
    }));

  } catch (error) {
    throw new AppError(error.message || "Failed to filter products", 500);
  }
};
exports.filterProductsServiceM = async (categoryId = null, min = null, max = null, page = 1, additionalFilters = {}) => {
  try {
    const query = { ...additionalFilters };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (min !== null || max !== null) {
      query.soldPrice = {};
      if (min !== null) query.soldPrice.$gte = min;
      if (max !== null) query.soldPrice.$lte = max;
    }

    const limit = 20;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const updatedProducts = products.map(product => ({
      ...product.toObject(),
      images: product.images.map(img => ({
        fileId: img.fileId,
        filePath: `${BASE_IMAGE_URL}${img.filePath}`
      }))
    }));

    return {
      products: updatedProducts,
      pagination: {
        currentPage: page,
        totalPages: totalProducts > 0 ? Math.ceil(totalProducts / limit) : 1,
        totalProducts,
        limit
      }
    };

  } catch (error) {
    throw new AppError(error.message || "Failed to filter products", 500);
  }
};

exports.getProductByIdFromWebsiteBranch = async (productId) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return {
      ...product.toObject(),
      images: product.images.map(img => ({
        fileId: img.fileId,
        filePath: `${BASE_IMAGE_URL}${img.filePath}`
      }))
    };

  } catch (error) {
    throw new AppError(`Failed to fetch product: ${error.message}`, 500);
  }
};


