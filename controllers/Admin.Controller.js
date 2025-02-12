const express = require('express');
const router = express.Router();
const sellerRequestService = require('../services/SellerReq.service');


// Get all pending requests
router.get('/requests', /*isAdmin or manager*/ async (req, res, next) => {
  try {
    const requests = await sellerRequestService.getPendingRequests(); //git all requests from the sellers that their status are pending in the admin page
    res.json({ status: 'success', data: requests });
  } catch (error) {
    next(error);
  }
});

// Process request (approve/reject)
router.put('/requests/:requestId', /*isAdmin or manager*/ async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; //action --> approve or reject(reject reason)
    const processedRequest = await sellerRequestService.processSellerRequest(
      req.params.requestId, //the id of the request
      action, //approve or rejected
      req.user._id, //processed by
      rejectionReason // incase reject action
    );
    res.json({ status: 'success', data: processedRequest });
  } catch (error) {
    next(error);
  }
});

module.exports = router;