const express = require('express');
const router = express.Router();
const {  getCategoryById} = require('../repos/category.repo');
const { handleImageUpload } = require("../services/upload.service");
const Product = require("../models/product.model");
const { AppError } = require("../utils/errorHandler");
const Branch = require("../models/branch.model"); 
const checkPermission = require("../middlewares/authorization.middleware"); 
const {
  validateProduct
  
} = require('../middlewares/productvalidate.middleware');

const productService = require('../services/product.service');

// ✅ Create product
router.post("/", checkPermission("product","create"),validateProduct, async (req, res, next) => {
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

router.get('/', checkPermission("product","getAllMainStock"),async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const products = await productService.getAllProducts(page);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

router.get('/search',checkPermission("product","searchAllMainStock"), async (req, res, next) => {
  try {
    const results = await productService.searchProducts(req.query.term);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});


router.get('/filter', checkPermission("product","filterAllMainStock"),async (req, res, next) => {
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




router.get('/:id', checkPermission("product","getById"),async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const { role: userRole, branchId: userBranchId } = req.user;

    
    if (userRole === "manager") {
      const branch = await Branch.findById(userBranchId).lean();

      if (!branch) {
        throw new AppError("Branch not found", 404);
      }

      const productInBranch = branch.stock.some(item => item.productId.toString() === productId);

      if (!productInBranch) {
        throw new AppError("You are not authorized to view this product", 403);
      }
    }

    const product = await productService.getProduct(productId);
    res.json({ success: true, data: product });

  } catch (error) {
    next(error);
  }
});






router.delete('/:id',checkPermission("product","deleteById"), async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.put('/:id', checkPermission("product","editById"),validateProduct, async (req, res, next) => {
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