const express = require("express");
const router = express.Router();
const {
  createSeller,
  getAllSellers,
  getSellerById,
  updateSeller,
  getSellerAddresses,
  addSellerAddress,
  getSellerDashboardData,
  deleteSellerAddressByIndex,
  getSellerProductsWithBranches,
  getAdminDashboardData,
} = require("../repos/seller.repo");
const { AppError } = require("../utils/errorHandler");

const { validateAddress } = require("../middlewares/addressValidation.midleware"); 
const checkPermission = require("../middlewares/authorization.middleware");



const { softDeleteUser } = require("../services/auth.service");


// Create a new seller
const bcrypt = require("bcrypt");

router.post("/", checkPermission("seller","create"),async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, companyName, companyRegistrationNumber, SSN } = req.body;

    if (!firstName || !lastName || !email || !password || !phone1 || !companyName || !companyRegistrationNumber || !SSN) {
      return next(new AppError("All required fields must be provided", 400));
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSeller = await createSeller({
      firstName,
      lastName,
      email,
      phone1,
      password: hashedPassword,  
      salt,  
      companyName,
      companyRegistrationNumber,
      SSN,
    });

    res.status(201).json({ success: true, data: newSeller });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const sellerId = req.user.sub; 
    const dashboardData = await getSellerDashboardData(sellerId);
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// Admin Dashboard Route with Filters
router.get("/admin/dashboard", checkPermission("seller", "getSellersAnalysis"),async (req, res, next) => {
  try {
    const { year, sellerId, branchId } = req.query;
    const dashboardData = await getAdminDashboardData({ year, sellerId, branchId });
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// Get all sellers
router.get("/", checkPermission("seller", "getAll"), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 20; 

    const { sellers, pagination } = await getAllSellers(page, limit);

    res.status(200).json({
      success: true,
      data: sellers,
      pagination: pagination,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});


// Get seller profile (from token)
router.get("/my/profile", async (req, res, next) => {
  try {
    const sellerId = req.user.sub; 
    const seller = await getSellerById(sellerId);
    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get a seller by ID
router.get("/:sellerId",checkPermission("seller","getById"), async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const seller = await getSellerById(sellerId);
    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Update seller profile (from token)
router.put("/my/profile", async (req, res, next) => {
  try {
    const sellerId = req.user.sub; 
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedSeller = await updateSeller(sellerId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedSeller });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// Update a seller
router.put("/:sellerId", checkPermission("seller","updateById"),async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedSeller = await updateSeller(sellerId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedSeller });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// Fetch Seller's Addresses Using Token
router.get("/my/addresses", async (req, res, next) => {
  try {
    const sellerId = req.user.sub; 
    const addresses = await getSellerAddresses(sellerId);
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get a Seller's Addresses (By ID)
router.get("/:sellerId/addresses", checkPermission("seller","getSellerAddressesBySellerId"),async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const addresses = await getSellerAddresses(sellerId);
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Add Address Using Token
router.post("/my/addresses", validateAddress, async (req, res, next) => {
  try {
    const sellerId = req.user.sub;
    const newAddress = req.body;

    const updatedAddresses = await addSellerAddress(sellerId, newAddress);

    res.status(200).json({ success: true, data: updatedAddresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Delete Address Using Token by Index for Seller
router.delete("/my/addresses/:index", async (req, res, next) => {
  try {
    const sellerId = req.user.sub; 
    const addressIndex = parseInt(req.params.index, 10);

    if (isNaN(addressIndex) || addressIndex < 0) {
      throw new AppError("Invalid address index", 400);
    }

    const updatedAddresses = await deleteSellerAddressByIndex(sellerId, addressIndex);

    res.status(200).json({ success: true, data: updatedAddresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});


// Add Address (By Seller ID)
router.post("/:sellerId/addresses",checkPermission("seller","addAddressToSellerById"), validateAddress, async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const newAddress = req.body;

    const updatedAddresses = await addSellerAddress(sellerId, newAddress);

    res.status(200).json({ success: true, data: updatedAddresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get all products for a seller along with their branch details
router.get("/my/products-with-branches", async (req, res, next) => {
  try {
    const sellerId = req.user.sub; 
    const products = await getSellerProductsWithBranches(sellerId); 
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});



// Delete a seller
 router.delete("/:sellerId",checkPermission("seller","deleteById"), async (req, res, next) => {
   try {
     const { sellerId } = req.params;
     const deletedSeller = await deleteSeller(sellerId);
     res.status(200).json({ success: true, data: deletedSeller });
   } catch (error) {
     return next(new AppError(error.message, 500));
   }
 });


router.delete("/", async (req, res, next) => {
  try {
    const  sellerId  = req.user.sub;

    // Call the softDeleteUser function
    const seller = await softDeleteUser(sellerId);

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
