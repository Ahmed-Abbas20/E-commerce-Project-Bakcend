const Seller = require("../models/seller.model");
const { uploadUserImage } = require("../services/userImageUpload.service");
const { AppError } = require("../utils/errorHandler");

// ✅ Create a new seller
module.exports.createSeller = async ({ firstName, lastName, email, phone1, password, salt, companyName, companyRegistrationNumber, SSN }) => {
  try {
    const seller = new Seller({
      firstName,
      lastName,
      email,
      phone1,
      password,
      salt,
      userType: "seller",
      companyName,
      companyRegistrationNumber,
      SSN,
    });

    await seller.save();
    return seller;
  } catch (error) {
    throw new AppError(`Error creating seller: ${error.message}`, 500);
  }
};

// ✅ Get all sellers
module.exports.getAllSellers = async () => {
  try {
    const sellers = await Seller.find({ userType: "seller" });
    return sellers;
  } catch (error) {
    throw new AppError(`Error fetching sellers: ${error.message}`, 500);
  }
};

// ✅ Get a seller by ID
module.exports.getSellerById = async (sellerId) => {
  try {
    const seller = await Seller.findOne({ _id: sellerId, userType: "seller" });
    if (!seller) throw new AppError("Seller not found", 404);

    return seller;
  } catch (error) {
    throw new AppError(`Error fetching seller: ${error.message}`, 500);
  }
};



// ✅ Update a seller
module.exports.updateSeller = async (sellerId, updatedData, uploadedFile = []) => {
  try {
    const existingSeller = await Seller.findOne({ _id: sellerId, userType: "seller" });

    if (!existingSeller) {
      throw new AppError("Seller not found", 404);
    }

    // ✅ Handle Image Upload
    const imageUpdate = await uploadUserImage(existingSeller.image?.fileId, uploadedFile);
    if (imageUpdate) {
      updatedData.image = imageUpdate;
    }

    // ✅ Update seller details
    Object.assign(existingSeller, updatedData);
    await existingSeller.save();

    return existingSeller;
  } catch (error) {
    throw new AppError(`Error updating seller: ${error.message}`, 500);
  }
};

// ✅ Delete a seller
module.exports.deleteSeller = async (sellerId) => {
  try {
    const deletedSeller = await Seller.findOneAndDelete({ _id: sellerId, userType: "seller" });
    if (!deletedSeller) throw new AppError("Seller not found", 404);

    return deletedSeller;
  } catch (error) {
    throw new AppError(`Error deleting seller: ${error.message}`, 500);
  }
};
