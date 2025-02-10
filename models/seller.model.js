const mongoose = require("mongoose");
const User = require("./base.model"); // ✅ Import User properly

const SellerSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyRegistrationNumber: { type: String, required: true },
  SSN: { type: String, required: true },
});

// ✅ Create Seller using `User.discriminator`
const Seller = User.discriminator("seller", SellerSchema);
module.exports = Seller;
