const SellerRequest = require('../models/SellerRequest.model');

exports.createRequest = (requestData) => SellerRequest.create(requestData);
exports.findRequestById = (id) => SellerRequest.findById(id).populate('seller product');
exports.updateRequest = (id, update) => SellerRequest.findByIdAndUpdate(id, update, { new: true });
exports.getPendingRequests = () => SellerRequest.find({ status: 'pending' }).populate('seller product');
exports.deleteRequest = (id) => SellerRequest.findByIdAndDelete(id);
exports.findBySellerAndId = (sellerId, requestId) =>  SellerRequest.findOne({ _id: requestId, seller: sellerId });