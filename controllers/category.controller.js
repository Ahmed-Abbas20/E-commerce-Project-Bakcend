const express = require('express');
const checkPermission = require("../middlewares/authorization.middleware"); 
const router = express.Router();
const {
  validateCategory,
  validateCategoryId
} = require('../middlewares/categoryvalidate.middleware');
const categoryService = require('../services/category.service');

router.post('/',checkPermission("category","create") ,validateCategory, async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
});

router.get('/',checkPermission("category","read") , async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const results = await categoryService.searchCategories(req.query.term);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateCategoryId, async (req, res, next) => {
  try {
    const category = await categoryService.getCategory(req.params.id);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateCategoryId, validateCategory, async (req, res, next) => {
  try {
    const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ success: true, data: updatedCategory });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validateCategoryId, async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;