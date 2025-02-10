const mongoose = require('mongoose');

const SellerReqSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller', 
    required: [true, 'Seller ID is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required']
  },
  productDescription: {
    type: String,
    required: [true, 'Product description is required'] 
  },
  productPrice: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  productImages: {
    type: [String], // Array of image URLs or file paths
    required: [true, 'At least one product image is required']
  },
  productCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Category',
    required: [true, 'Product category is required']
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SellerRequest', SellerReqSchema);