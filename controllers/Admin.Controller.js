const express = require('express');
const router = express.Router();
const {
  processRequest,
  getPendingRequests
} = require('../services/sellerRequest.service');


router.get('/requests', async (req, res, next) => {
  try {
    const requests = await getPendingRequests();
    res.json({ status: 'success', data: requests });
  } catch (error) {
    next(error);
  }
});

router.patch('/requests/:id', async (req, res, next) => {
  try {
    const request = await processRequest(
      req.params.id,
      req.user._id,
      req.body.action,
      req.body.reason
    );
    res.json({ status: 'success', data: request });
  } catch (error) {
    next(error);
  }
});

module.exports = router;