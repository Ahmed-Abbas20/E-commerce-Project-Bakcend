const mongoose = require('mongoose');

const SellerRequestSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operationType: { type: String, enum: ['create', 'update', 'delete'], required: true },
  productData: mongoose.Schema.Types.Mixed,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  images: [{
    fileId: String,
    filePath: String,
    status: { type: String, enum: ['pending', 'committed'], default: 'pending' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SellerRequest', SellerRequestSchema);