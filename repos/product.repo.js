const Product = require('../models/product.model');

const BASE_IMAGE_URL = "https://ik.imagekit.io/cwe4zwtml"; 
const {AppError} = require("../utils/errorHandler"); 
const { deleteProductImages} = require("../services/media.service");
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
exports.createProduct = (productData) => Product.create(productData);
exports.searchProducts = async (searchTerm) => {
  const products = await Product.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  });

  
  return products.map(product => ({
    ...product.toObject(),
    images: product.images.map(img => ({
      fileId: img.fileId,
      filePath: `${BASE_IMAGE_URL}/${img.filePath}`
    }))
  }));
};

exports.getProductById = async (id) => {
  const product = await Product.findById(id);

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
};




exports.getAllProducts = async (page = 1, filters = {}) => {
  const products = await Product.find(filters)
  . populate({
    path: 'sellerId', 
    select: 'firstName lastName email phone1 ' 
  })
    .sort('-createdAt')
    .skip((page - 1) * 20)
    .limit(20)
    


  const updatedProducts = products.map(product => ({
    ...product.toObject(),  
    images: product.images.map(img => ({
      fileId: img.fileId, 
      filePath: `${BASE_IMAGE_URL}${img.filePath}`  
    }))
  }));

  return updatedProducts;
};

exports.updateProduct = (id, updateData) =>
  Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
exports.deleteProduct = async (id) => {
  try {
  
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

   
    const imageFileIdsToRemove = product.images.map(img => img.fileId);

    
    if (imageFileIdsToRemove.length > 0) {
      await deleteProductImages(imageFileIdsToRemove);
    }

  
    const folderPath = `product_images/${product.name.replace(/\s+/g, "_")}`;

   
    try {
      await imagekit.deleteFolder(`/${folderPath}`);
    } catch (folderError) {
      if (!folderError.message.includes("Folder not found")) {
        throw new AppError(`Failed to delete folder: ${folderError.message}`, 500);
      }
    }

    await Product.findByIdAndDelete(id);

  } catch (error) {
    throw new AppError(error.message || "Failed to delete product", 500);
  }
};


exports.filterProducts = (query, page = 1) =>  Product.find(query).skip((page - 1) *20).limit(20);

exports.findProductById = async (productId, session = null) => {
  return Product.findById(productId).session(session);
};
exports.updateMainStock = async (productId, quantity, session = null) => {
  return Product.findByIdAndUpdate(
    productId,
    { $inc: { mainStock: quantity } },
    { session }
  );
};