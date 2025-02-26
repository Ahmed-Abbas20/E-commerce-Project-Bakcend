const mongoose = require("mongoose");
const User = require("./base.model"); 

const SellerSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyRegistrationNumber: { type: String, required: true },
  SSN: { type: String, required: true },
  isActive: { type: Boolean, default: true },

});

const Seller = User.discriminator("seller", SellerSchema);
module.exports = Seller;
