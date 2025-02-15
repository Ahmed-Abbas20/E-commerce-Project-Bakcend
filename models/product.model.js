
const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ fileId: { type: String, required: true }, filePath: { type: String, required: true } }],
  description: String,
  mainStock: { type: Number, min: 0 }, // Central stock for all branches
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  categoryName: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);