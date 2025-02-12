const express = require('express');
const router = express.Router();
const sellerRequestService = require('../services/SellerReq.service');
const { validateRequest } = require('../middlewares/productvalidate.middleware');

const { productRequestSchema } = require('../middlewares/productvalidate.middleware');

// Create new request
router.post('/',
  validateRequest(productRequestSchema),
  async (req, res, next) => {
    try {
      const requestData = {
        operationType: req.body.operationType,
        productData: req.body.productData,
        product: req.body.product,
        images: req.body.images || []
      };
      
      const newRequest = await sellerRequestService.createSellerRequest(
        req.user._id,
        requestData
      );
      
      res.status(201).json({
        status: 'success',
        data: newRequest
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update existing request
router.put('/requests/:requestId',
  
  validateRequest(productRequestSchema),
  async (req, res, next) => {
    try {
      const updatedRequest = await sellerRequestService.updateSellerRequest(
        req.user._id,
        req.params.requestId,
        req.body
      );
      res.json({ status: 'success', data: updatedRequest });
    } catch (error) {
      next(error);
    }
  }
);

// Delete request
router.delete('/requests/:requestId',
  
  async (req, res, next) => {
    try {
      const result = await sellerRequestService.deleteSellerRequest(
        req.user._id,
        req.params.requestId
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;