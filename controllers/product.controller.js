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


router.post("/bulk-upload", async (req, res, next) => {
  try {
    const productsData = req.body; // Assuming products are sent in JSON format

    if (!Array.isArray(productsData) || productsData.length === 0) {
      return res.status(400).json({ success: false, message: "No products provided for upload." });
    }

    // Validate and process products
    const createdProducts = [];
    for (const productData of productsData) {
      const category = await getCategoryById(productData.categoryId);
      if (!category) throw new AppError(`Category not found for product: ${productData.name}`, 404);

      const existingProduct = await Product.findOne({
        name: productData.name.trim(),
        sellerId: productData.sellerId,
      });
      if (existingProduct) throw new AppError(`Product "${productData.name}" already exists`, 409);

      const newProduct = await Product.create({
        ...productData,
        name: productData.name.trim(),
        categoryName: category.name,
      });

      // Save images directly from provided paths
      if (productData.images && productData.images.length > 0) {
        newProduct.images = productData.images;
        await newProduct.save();
      }

      createdProducts.push(newProduct);
    }

    res.status(201).json({ success: true, message: "Products uploaded successfully", data: createdProducts });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});


// ✅ Create product
router.post("/", validateProduct, async (req, res, next) => {
  try {
    const productData = req.body;
    const uploadedFiles = req.files?.images ? (Array.isArray(req.files.images) ? req.files.images : [req.files.images]) : [];
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, message: "At least one image is required." });
    }

    const product = await productService.createProductService(productData, uploadedFiles);
    res.status(201).json({ success: true, message: "Product created successfully.", data: product });
  } catch (error) {
    next(error);
  }
});

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
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
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

router.put('/:id', validateProduct, async (req, res, next) => {
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