const express = require('express');
const router = express.Router();
const {
  validateProduct,
  validateProductId
} = require('../middlewares/productvalidate.middleware');
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

router.get('/filter/price', async (req, res, next) => {
  try {
    const { min, max, page } = req.query;
    const results = await productService.filterByPrice(min, max, page || 1);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const products = await productService.getByCategory(req.params.categoryId, page);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateProductId, async (req, res, next) => {
  try {
    const product = await productService.getProduct(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', checkPermission("products","update"),validateProductId, validateProduct, async (req, res, next) => {
  try {
    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id',checkPermission("products","delete"), validateProductId, async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;