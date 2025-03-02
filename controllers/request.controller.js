const express = require("express");
const router = express.Router();
const checkPermission = require("../middlewares/authorization.middleware");
const requestRepo = require("../repos/request.repo");
const { AppError } = require("../utils/errorHandler");
const { validateRequestData } = require("../middlewares/requestValidation.middleware");





// Get all products in branch & available products in main stock
router.get('/branch/products', checkPermission("request", "getMyBranchProducts"), async (req, res, next) => {
    try {
        const branchId = req.user.branchId;
        if (!branchId) {
            throw new AppError("Branch ID not found for the current user.", 400);
        }
        const { branchProducts, availableMainStockProducts } = await requestRepo.getBranchAndMainStockProducts(branchId);

        res.status(200).json({
            success: true,
            branchProducts,
            availableMainStockProducts
        });
    } catch (error) {
        next(error);
    }
});


// Manager creates a request (with validation middleware)
router.post("/", checkPermission("request", "create"), validateRequestData, async (req, res, next) => {
    try {
        const { managerId, branchId, products } = req.validatedRequest;

        const request = await requestRepo.createRequest(managerId, branchId, products);

        res.status(201).json({
            success: true,
            message: "Request submitted successfully",
            data: request,
        });
    } catch (error) {
        next(error);
    }
});

// Manager fetches their own requests
router.get("/my-requests",  async (req, res, next) => {
    try {
      const managerId = req.user.sub;
      const requests = await requestRepo.getRequestsByManager(managerId);
  
      res.json({ success: true, data: requests });
    } catch (error) {
      next(error);
    }
  });

// Approve All Request
router.put("/:id/approve-all", checkPermission("request", "approveFull"), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { adminResponse } = req.body;
  
      const updatedRequest = await requestRepo.approveFullRequest(id, adminResponse);
      res.json({ success: true, message: "Request fully approved", data: updatedRequest });
    } catch (error) {
      next(error);
    }
  });
// Approve Partial Request
  router.put("/:id/approve-partial", checkPermission("request", "approvePartial"), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { adminResponse, approvedProducts } = req.body;
  
      if (!approvedProducts || approvedProducts.length === 0) {
        return next(new AppError("At least one product must be partially approved", 400));
      }
  
      const updatedRequest = await requestRepo.approvePartialRequest(id, adminResponse, approvedProducts);
      res.json({ success: true, message: "Request partially approved", data: updatedRequest });
    } catch (error) {
      next(error);
    }
  });
  
  

// Get all requests (Admin)
router.get("/", checkPermission("request", "getAll"), async (req, res, next) => {
  try {
    const requests = await requestRepo.getRequests();
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
});

// Get request by ID
router.get("/:id", checkPermission("request", "getById"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await requestRepo.getRequestById(id);
    if (!request) return next(new AppError("Request not found", 404));
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
});


  

  // Reject Request (Admin)
router.put("/:id/reject", checkPermission("request", "reject"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { adminResponse } = req.body;

        if (!adminResponse || adminResponse.trim() === "") {
            return next(new AppError("Admin response is required for rejection", 400));
        }

        const updatedRequest = await requestRepo.rejectRequest(id, adminResponse);
        res.json({ success: true, message: "Request rejected", data: updatedRequest });
    } catch (error) {
        next(error);
    }
});


module.exports = router;
