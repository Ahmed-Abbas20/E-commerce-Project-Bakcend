const express = require('express');
const router = express.Router();
const {  getCategoryById} = require('../repos/category.repo');
const { handleImageUpload } = require("../services/upload.service");
const Product = require("../models/product.model");
const { AppError } = require("../utils/errorHandler");
const checkPermission = require("../middlewares/authorization.middleware"); 
const {
  validateProduct
  
} = require('../middlewares/productvalidate.middleware');

const productService = require('../services/product.service');

router.post(
  "/",
  checkPermission("products", "create"),
  validateProduct,
  async (req, res, next) => {
    try {
      
      const productData = req.body;
      const uploadedFiles = req.files?.images 
        ? (Array.isArray(req.files.images) ? req.files.images : [req.files.images]) 
        : [];

    
      const category = await getCategoryById(productData.categoryId);
      if (!category) {
        throw new AppError("Category not found", 404);
      }

      
      const existingProduct = await Product.findOne({
        name: productData.name.trim(),
        sellerId: productData.sellerId,
      });

      if (existingProduct) {
        throw new AppError("You already have a product with this name", 409);
      }

      // Create product in DB (WITHOUT images for now)
      const product = await Product.create({
        ...productData,
        name: productData.name.trim(),
        categoryName: category.name,
      });

      // Upload images (if provided)
      if (uploadedFiles.length > 0) {
        const uploadedImages = await handleImageUpload(Product, product._id, uploadedFiles);
        product.images = uploadedImages; // ✅ Store both fileId & filePath
        await product.save();
      }

     
      res.status(201).json({
        success: true,
        message: "Product created successfully.",
        data: product,
      });
    } catch (error) {
      next(error);
    }

  }
);


router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const products = await productService.getAllProducts(page);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const results = await productService.searchProducts(req.query.term);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});



router.get('/filter', async (req, res, next) => {
  try {
    const { categoryId, min, max, page = 1 } = req.query;

    // Parse query parameters with default values
    const parsedMin = min ? parseFloat(min) : null;
    const parsedMax = max ? parseFloat(max) : null;
    const parsedPage = page ? parseInt(page) : 1;

    // Validate parsed values
    if (parsedPage < 1) {
      return next(new AppError('Page number must be greater than 0', 400));
    }
    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      return next(new AppError('Min price cannot be greater than max price', 400));
    }

    // Call the service function
    const products = await productService.filterProductsService(categoryId, parsedMin, parsedMax, parsedPage);


    res.json({ success: true, data: products });
  } catch (error) {
    return next(error); 
  }
});


router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getProduct(req.params.id);
    if(!product) res.json({data:"no products found"})
    res.json({ success: true, data: product });
  } catch (error) {
     return next(new AppError(error.message, 500));
  }
});





router.delete('/:id', checkPermission("products", "delete"), async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.put('/:id', checkPermission("products", "update"), validateProduct, async (req, res, next) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    const uploadedFiles = Array.isArray(req.files?.images) ? req.files.images : [req.files?.images].filter(Boolean);
    const imagesToRemove = Array.isArray(req.body.imagesToRemove) ? req.body.imagesToRemove : [];
    const updatedProduct = await productService.updateProduct(productId, productData, uploadedFiles, imagesToRemove);

    res.json({
      success: true,
      message: "Product updated successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;