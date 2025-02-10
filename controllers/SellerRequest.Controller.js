const express = require('express');
const router = express.Router();
const {
  createSellerRequest
} = require('../services/sellerRequest.service');
const { validateRequest, productRequestSchema } = require('../middlewares/productvalidate.middleware');


router.post('/requests', 
  validateRequest(productRequestSchema),
  async (req, res, next) => {
    try {
      const request = await createSellerRequest(req.user._id, req.body);
      res.status(201).json({
        status: 'success',
        data: request
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/requests', async (req, res, next) => {
  try {
    const requests = await getSellerRequests(req.user._id);
    res.json({ status: 'success', data: requests });
  } catch (error) {
    next(error);
  }
});

async function getSellerRequests(sellerId) {
  // Implementation to get seller's requests
}

module.exports = router;