
const mongoose = require('mongoose');
const MainInventory = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  soldPrice: {
    type: Number,
    required: true,
    min: 0
  },
  images: [
    {
      fileId: { type: String, required: true }, 
      filePath: { type: String, required: true } 
    }
  ],
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


  sellerId:{type: String, ref:'User' ,required:true},

  createdAt: {
    type: Date, 
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }
});
module.exports = mongoose.model('MainInventory', MainInventory);