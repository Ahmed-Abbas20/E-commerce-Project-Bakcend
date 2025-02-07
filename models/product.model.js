const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique:true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [String],
  description: String,
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  categoryId: {
    type: String,
    ref: 'Category',
    required: true
  },
  categoryName: {
    type: String,
    required: true
  },
  sellerId:{type: String},
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }   
});

module.exports = mongoose.model('Product', ProductSchema);