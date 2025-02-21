const express = require("express");
const router = express.Router();


const { filterBranchProducts,searchBranchProducts  ,addProductToBranch,removeProductFromBranch} = require('../services/Branch.service');
const { AppError } = require('../utils/errorHandler');
const checkPermission = require("../middlewares/authorization.middleware");

const {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  getBranchByManagerId
} = require("../repos/branch.repo");
const { validateBranch } = require("../middlewares/branchValidation.midleware");

router.post("/", validateBranch, async (req, res, next) => {
  try {
    const branch = await createBranch(req.body);
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const branches = await getAllBranches();
    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
});

router.get("/:branchId", async (req, res, next) => {
  try {
    const branch = await getBranchById(req.params.branchId);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.put("/:branchId", validateBranch, async (req, res, next) => {
  try {
    const branch = await updateBranch(req.params.branchId, req.body);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.delete("/:branchId", async (req, res, next) => {
  try {
    const branch = await deleteBranch(req.params.branchId);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});


//////////products operation for single branch////////////////

//filter by categoryname or soldprice max or min and with the page ll of them optional

router.get('/filterproducts/:branchId', async (req, res, next) => {
  try {
    // Validate parameters
    const { branchId } = req.params;
    const { category, min, max, page = 1 } = req.query;

    if (!branchId) throw new AppError("Branch ID is required", 400);
    
    // Validate numeric parameters
    const numericFilters = {};
    if (min !== undefined) {
      numericFilters.min = parseFloat(min);
      if (isNaN(numericFilters.min)) throw new AppError("Invalid minimum price", 400);
    }
    if (max !== undefined) {
      numericFilters.max = parseFloat(max);
      if (isNaN(numericFilters.max)) throw new AppError("Invalid maximum price", 400);
    }
    if (isNaN(page) || page < 1) throw new AppError("Invalid page number", 400);

    // Execute service
    const result = await filterBranchProducts(branchId, {
      category,
      ...numericFilters,
      page: parseInt(page, 10)
    });

    res.status(200).json({
      status: 'success',
      data: {
        products: result.products,
        pagination: {
          totalItems: result.total,
          currentPage: result.page,
          totalPages: result.totalPages,
          itemsPerPage: 20
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

//search for a specific product name in the branch
router.get('/searchproducts/:branchId', async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { term } = req.query;

    // Validate inputs
    if (!branchId) throw new AppError("Branch ID is required", 400);
    if (!term) throw new AppError("Search term is required", 400);

    // Execute search
    const results = await searchBranchProducts(branchId, term);

    res.status(200).json({
      status: 'success',
      results: results.length,
      data: results
    });

  } catch (error) {
    next(error);
  }
});


// POST /branches/:branchId/add-product
router.post('/add-product/:branchId',  async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { productId, quantity } = req.body;

    if (!branchId || !productId || !quantity) {
      throw new AppError('Missing required parameters', 400);
    }

    const result = await addProductToBranch(branchId, productId, quantity);
    
    res.status(200).json({
      status: 'success',
      message: `Product ${result.action} successfully`,
      newQuantity: result.newQuantity
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /branches/:branchId/remove-product
router.delete('/remove-product/:branchId/', async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { productId, quantity } = req.body;

    if (!branchId || !productId || !quantity) {
      throw new AppError('Missing required parameters', 400);
    }

    await removeProductFromBranch(branchId, productId, quantity);
    
    res.status(200).json({
      status: 'success',
      message: 'Product removed from branch successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.get('BranchProducts/:branchId/',async (req, res, next) => {
  try {
    const products = await BranchService.getProductsInBranch(req.params.branchId);
    res.status(200).json({
      status: "success",
      results: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

router.get("/mybranch", async (req, res, next) => {
  try {
    const managerId = req.user.sub; 
    const branch = await getBranchByManagerId(managerId);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});



module.exports = router;