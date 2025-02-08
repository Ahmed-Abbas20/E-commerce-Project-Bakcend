// models/SellerRequest.js
const mongoose = require('mongoose');

const SellerReqSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller ID is required']
  },
  operationType: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true
  },
  productData: {
    type: mongoose.Schema.Types.Mixed,
    required: function () {
      return this.operationType === 'create' || this.operationType === 'update';
    }
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function () {
      return this.operationType === 'update' || this.operationType === 'delete';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
}, { timestamps: true });

module.exports = mongoose.model('SellerRequest', SellerReqSchema);