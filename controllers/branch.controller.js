const express = require("express");
const router = express.Router();


const { AppError } = require('../utils/errorHandler');
const checkPermission = require("../middlewares/authorization.middleware");

const {
  createBranch,
  getAllBranches,
  findBranchById,
  updateBranch,
  deleteBranch,
  filterBranchProducts,searchBranchProducts  ,addProductToBranch,removeProductFromBranch,getProductsInBranch,



} = require("../repos/branch.repo");
const { validateBranch } = require("../middlewares/branchValidation.midleware");

router.post("/",checkPermission("branch","create"), validateBranch, async (req, res, next) => {
  try {
    const branch = await createBranch(req.body);
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.get("/", checkPermission("branch","getAll"),async (req, res, next) => {
  try {
    const branches = await getAllBranches();
    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
});

router.get("/:branchId", checkPermission("branch","getBranchById"),async (req, res, next) => {
  try {
    const branch = await findBranchById(req.params.branchId);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.put("/:branchId",checkPermission("branch","updateById"), validateBranch, async (req, res, next) => {
  try {
    const branch = await updateBranch(req.params.branchId, req.body);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.delete("/:branchId",checkPermission("branch","deleteById"), async (req, res, next) => {
  try {
    const branch = await deleteBranch(req.params.branchId);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});




//filter by categoryname or soldprice max or min and with the page ll of them optional

router.get('/filterproducts/:branchId' ,checkPermission("branch","filterProductsByBranchId"), async (req, res, next) => {
  try {
   
    const { branchId } = req.params;
    const { category, min, max, page = 1 } = req.query;

    if (!branchId) throw new AppError("Branch ID is required", 400);
    
  
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
router.get('/searchproducts/:branchId',checkPermission("branch","searchProductsByBranchId"), async (req, res, next) => {
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
router.post('/add-product/:branchId' , checkPermission("branch", "addProductToBranchId"), async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { productId, quantity } = req.body;

    if (!branchId || !productId || !quantity) {
      throw new AppError('Missing required parameters', 400);
    }

    const result = await addProductToBranch(branchId, productId, quantity);

    res.status(200).json({
      success: true,
      message: `Product ${result.action} successfully`,
      newQuantity: result.newQuantity
    });
  } catch (error) {
    next(error);
  }
});




// DELETE /branches/:branchId/remove-product
router.delete('/remove-product/:branchId/' ,checkPermission("branch","removeProductFromBranchId"), async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { productId} = req.body;

    if (!branchId || !productId ) {
      throw new AppError('Missing required parameters', 400);
    }

    await removeProductFromBranch(branchId, productId);
    
    res.status(200).json({
      status: 'success',
      message: 'Product removed from branch successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/BranchProducts/:branchId/', checkPermission("branch","getProductsByBranchId"),async (req, res, next) => {
  try {
    const products = await getProductsInBranch(req.params.branchId);
    res.status(200).json({
      status: "success",
      results: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

router.get('/my/BranchProducts/',checkPermission("branch","getMyBranchProducts"),async (req, res, next) => {
  try {

    const branchId = req.user.branchId;
    
    if (!branchId) {
      throw new AppError("Branch ID not found for the current user.", 400);
    }
    const products = await getProductsInBranch(branchId);
    res.status(200).json({
      status: "success",
      results: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
});



module.exports = router;