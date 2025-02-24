const express = require('express');
const checkPermission = require("../middlewares/authorization.middleware"); 
const router = express.Router();
const {validateCategory} = require('../middlewares/categoryvalidate.middleware');

const categoryService = require('../services/category.service');
router.post('/' ,checkPermission("category","create"),validateCategory, async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
});



router.put('/:id', checkPermission("category","updateById"),validateCategory, async (req, res, next) => {
  try {
    const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ success: true, data: updatedCategory });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id',checkPermission("category","deleteById"), async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});



module.exports = router;