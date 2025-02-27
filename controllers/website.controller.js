

const express = require('express');
const router = express.Router();
const { AppError } = require("../utils/errorHandler");
const Branch = require("../models/branch.model"); 
const productService = require('../services/product.service');
const categoryService = require('../services/category.service');

router.get('/products', async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      
  
      let filters = {};
  
      
        const websiteBranch = await Branch.findOne({ name: "Website Branch" });
  
        if (!websiteBranch) {
          throw new AppError("Website Branch not found.", 404);
        }
  
        // Filter by products available in the Website Branch stock
        filters = { _id: { $in: websiteBranch.stock.map(item => item.productId) } };
      
      const products = await productService.getAllProducts(page,20,filters);
  
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  });
  
  
  router.get('/products/search', async (req, res, next) => {
    try {
      const searchTerm = req.query.term;
      
  
      let filters = {};
  
        const websiteBranch = await Branch.findOne({ name: "Website Branch" });
  
        if (!websiteBranch) {
          throw new AppError("Website Branch not found.", 404);
        }
  
        filters = { _id: { $in: websiteBranch.stock.map(item => item.productId) } };
      
  
      const results = await productService.searchProducts(searchTerm, filters);
  
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  });
  
  
  router.get('/products/filter', async (req, res, next) => {
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
  
        const websiteBranch = await Branch.findOne({ name: "Website Branch" });
  
        if (!websiteBranch) {
          throw new AppError("Website Branch not found.", 404);
        }
  
        filters = { _id: { $in: websiteBranch.stock.map(item => item.productId) } };
      
  
      const products = await productService.filterProductsServiceM(categoryId, parsedMin, parsedMax, parsedPage, filters);
  
      res.json({ success: true, data: products });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/products/:id', async (req, res, next) => {
    try {
      const { id: productId } = req.params;
  
      const websiteBranch = await Branch.findOne({ name: "Website Branch" }).lean();
  
      if (!websiteBranch) {
        throw new AppError("Website Branch not found", 404);
      }
  
      const productInBranch = websiteBranch.stock.some(item => item.productId.toString() === productId);
  
      if (!productInBranch) {
        throw new AppError("Product not found in Website Branch", 404);
      }
  
      const product = await productService.getProductByIdFromWebsiteBranch(productId);
      res.json({ success: true, data: product });
  
    } catch (error) {
      next(error);
    }
  });

  router.get('/categories' , async (req, res, next) => {
    try {
      const categories = await categoryService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  });
  
  router.get('/categories/search', async (req, res, next) => {
    try {
      const results = await categoryService.searchCategories(req.query.term);
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  });
  
  router.get('/categories/:id', async (req, res, next) => {
    try {
      const category = await categoryService.getCategory(req.params.id);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  });
  module.exports = router;