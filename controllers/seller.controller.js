const express = require("express");
const router = express.Router();
const {
  createSeller,
  getAllSellers,
  getSellerById,
  updateSeller,
  deleteSeller,
} = require("../repos/seller.repo");
const { AppError } = require("../utils/errorHandler");
const checkPermission = require("../middlewares/authorization.middleware"); 
const { softDeleteUser } = require("../services/auth.service");

// ✅ Create a new seller (Uses `createSeller` from the repo)
router.post("/", checkPermission("sellers", "create"), async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, companyName, companyRegistrationNumber, SSN } = req.body;

    if (!firstName || !lastName || !email || !password || !phone1 || !companyName || !companyRegistrationNumber || !SSN) {
      return next(new AppError("All required fields must be provided", 400));
    }

    const newSeller = await createSeller({
      firstName,
      lastName,
      email,
      password,
      phone1,
      companyName,
      companyRegistrationNumber,
      SSN,
    });

    res.status(201).json({ success: true, data: newSeller });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Get all sellers
router.get("/", checkPermission("sellers","read"),async (req, res, next) => {
  try {
    const sellers = await getAllSellers();
    res.status(200).json({ success: true, data: sellers });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Get a seller by ID
router.get("/:sellerId", checkPermission("sellers","read"),async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const seller = await getSellerById(sellerId);
    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});



// ✅ Update a seller
router.put("/:sellerId", checkPermission("sellers","update"),async (req, res, next) => {
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

// ✅ Delete a seller
// router.delete("/:sellerId",checkPermission("sellers","delete"), async (req, res, next) => {
//   try {
//     const { sellerId } = req.params;
//     const deletedSeller = await deleteSeller(sellerId);
//     res.status(200).json({ success: true, data: deletedSeller });
//   } catch (error) {
//     return next(new AppError(error.message, 500));
//   }
// });

router.delete("/:sellerId", async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    // Call the softDeleteUser function
    const seller = await softDeleteUser(sellerId);

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    next(error); // Pass the error to the errorHandler middleware
  }
});

module.exports = router;
