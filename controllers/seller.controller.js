const express = require("express");
const router = express.Router();
const {
  createSeller,
  getAllSellers,
  getSellerById,
  updateSeller,
  getSellerAddresses,
  addSellerAddress,
  deleteSeller,
} = require("../repos/seller.repo");
const { AppError } = require("../utils/errorHandler");

const { validateAddress } = require("../middlewares/addressValidation.midleware"); 
const checkPermission = require("../middlewares/authorization.middleware");
const { verifyToken } = require("../utils/jwttoken.manager");


const { softDeleteUser } = require("../services/auth.service");


// Create a new seller
const bcrypt = require("bcrypt");

router.post("/", async (req, res, next) => {
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


// Get all sellers
router.get("/", async (req, res, next) => {
  try {
    const sellers = await getAllSellers();
    res.status(200).json({ success: true, data: sellers });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get seller profile (from token)
router.get("/my/profile", async (req, res, next) => {
  try {
    const sellerId = req.user.sub; // Extract from token
    const seller = await getSellerById(sellerId);
    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get a seller by ID
router.get("/:sellerId", async (req, res, next) => {
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
    const sellerId = req.user.sub; // Extract from token
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedSeller = await updateSeller(sellerId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedSeller });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// Update a seller
router.put("/:sellerId", async (req, res, next) => {
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
    const sellerId = req.user.sub; // Extract from token
    const addresses = await getSellerAddresses(sellerId);
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get a Seller's Addresses (By ID)
router.get("/:sellerId/addresses", async (req, res, next) => {
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
    const sellerId = req.user.sub; // Extract from token
    const newAddress = req.body;

    const updatedAddresses = await addSellerAddress(sellerId, newAddress);

    res.status(200).json({ success: true, data: updatedAddresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Add Address (By Seller ID)
router.post("/:sellerId/addresses", validateAddress, async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const newAddress = req.body;

    const updatedAddresses = await addSellerAddress(sellerId, newAddress);

    res.status(200).json({ success: true, data: updatedAddresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});


// Delete a seller
// router.delete("/:sellerId",checkPermission("sellers","delete"), async (req, res, next) => {
//   try {
//     const { sellerId } = req.params;
//     const deletedSeller = await deleteSeller(sellerId);
//     res.status(200).json({ success: true, data: deletedSeller });
//   } catch (error) {
//     return next(new AppError(error.message, 500));
//   }
// });


router.delete("/", async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    // Verify and decode the token
    const decoded = verifyToken(token);
    const sellerId = decoded.sub; // Assuming the user ID is stored in the 'sub' claim

    // Call the softDeleteUser function
    const seller = await softDeleteUser(sellerId);

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    next(error); // Pass the error to the errorHandler middleware
  }
});

module.exports = router;
