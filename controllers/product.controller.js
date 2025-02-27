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


// Create product
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

router.get('/', checkPermission("product", "getAllMainStock"), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; 

    let filters = {}; 

    // Fetch paginated data with metadata
    const { products, pagination } = await productService.getAllProducts(page, limit, filters);

    res.status(200).json({
      success: true,
      data: products,
      pagination:pagination
    });
  } catch (error) {
    next(error);
  }
});



router.get('/search', checkPermission("product","searchAllMainStock"),async (req, res, next) => {
  try {
    const searchTerm = req.query.term;
    let filters = {};
    const results = await productService.searchProducts(searchTerm, filters);

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});



router.get('/filter', checkPermission("product","filterAllMainStock"),async (req, res, next) => {
  try {
    const { categoryId, min, max, page = 1 } = req.query;

    const parsedMin = min ? parseFloat(min) : null;
    const parsedMax = max ? parseFloat(max) : null;
    const parsedPage = page ? parseInt(page) : 1;

    if (parsedPage < 1) {
      return next(new AppError('Page number must be greater than 0', 400));
    }
    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      return next(new AppError('Min price cannot be greater than max price', 400));
    }
    let filters = {};
    const products = await productService.filterProductsServiceS(categoryId, parsedMin, parsedMax, parsedPage, filters);

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

router.put('/:id', checkPermission("product","updateById"),validateProduct, async (req, res, next) => {
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
 

router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;

    if (!categoryId) {
      return next(new AppError("Category ID is required", 400));
    }

    const filters = { categoryId };
    const products = await productService.getAllProducts(page, filters);

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});


module.exports = router;