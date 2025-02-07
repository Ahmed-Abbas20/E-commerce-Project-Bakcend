const express = require('express');
const router = express.Router();
const {AppError} = require("../utils/errorHandler"); 
const checkPermission = require("../middlewares/authorization.middleware"); 
const {validateProduct} = require('../middlewares/productvalidate.middleware');

const productService = require('../services/product.service');


router.post('/', checkPermission("products","create"),validateProduct, async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
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

    // Return the results
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

router.put('/:id', checkPermission("products","update"),validateProduct, async (req, res, next) => {
  try {
    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id',checkPermission("products","delete"), async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;