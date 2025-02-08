// repos/sellerRequestRepo.js
const SellerRequest = require('../models/SellerRequest.model');

const createRequest = async (requestData) => {
  return await SellerRequest.create(requestData);
};

const findById = async (id) => {
  return await SellerRequest.findById(id).populate('sellerId').populate('productId');
};

const findBySellerId = async (sellerId) => {
  return await SellerRequest.find({ sellerId }).populate('productId');
};

const updateStatus = async (id, status, rejectionReason = '') => {
  return await SellerRequest.findByIdAndUpdate(
    id,
    { status, rejectionReason },
    { new: true }
  );
};

module.exports = {
  createRequest,
  findById,
  findBySellerId,
  updateStatus
};