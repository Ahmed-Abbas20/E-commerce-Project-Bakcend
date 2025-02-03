const User = require("../models/base.model");
const Staff = require("../models/staff.model");
const Seller = require("../models/seller.model");
const bcrypt = require("bcrypt");
const {AppError} = require("../utils/errorHandler"); 

// Get all sellers
module.exports.getSellers = async () => {
  try {
    const sellers = await Seller.find({});
    return sellers;
  } catch (error) {
    throw new AppError("Error fetching sellers: " + error.message, 500); 
  }
};

// Create a new seller
module.exports.createSeller = async ({ firstName, lastName, email, password, phone1, userType = "seller",companyName,companyRegistrationNumber,SSN, role }) => {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare seller data
    const sellerData = {
      firstName,
      lastName,
      email,
      phone1,
      userType,
      password: hashedPassword,
      salt,
      companyName,
      companyRegistrationNumber,
        SSN,
    };

      let seller = new seller(sellerData);
      
   

    // Save the seller to the database
    await seller.save();

    // Prepare claims for the token
    const claims = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role,
    };

    return claims;
  } catch (error) {
    throw new AppError("Error creating seller: " + error.message, 500); 
  }
};
// Update a seller
module.exports.updateSeller = async (sellerId, updatedData) => {
  try {
    const updatedSeller = await Seller.findByIdAndUpdate(sellerId, updatedData, { new: true });
    if (!updatedSeller) {
      throw new AppError("Seller not found", 404); 
    }
    return updatedSeller;
  } catch (error) {
    throw new AppError("Error updating seller: " + error.message, 500); 
  }
};

// Delete a seller
module.exports.deleteSeller = async (sellerId) => {
  try {
    const deletedSeller = await Seller.findByIdAndDelete(sellerId);
    if (!deletedSeller) {
      throw new AppError("Seller not found", 404); 
    }
    return deletedSeller;
  } catch (error) {
    throw new AppError("Error deleting seller: " + error.message, 500); 
  }
};

// Get a seller by email
module.exports.getSellerByEmail = async ({ email }) => {
  try {
    const seller = await Seller.findOne({ email });

    if (!seller) {
      throw new AppError("Seller not found", 404); 
    }

    return seller;
  } catch (error) {
    throw new AppError("Error fetching seller by email: " + error.message, 500); 
  }
};

