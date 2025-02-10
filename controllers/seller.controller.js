const express = require("express");
const router = express.Router();
const {
  getAllSellers,
  getSellerById,
  updateSeller,
  deleteSeller,
} = require("../repos/seller.repo");
const { AppError } = require("../utils/errorHandler");

// ✅ Get all sellers
router.get("/", async (req, res, next) => {
  try {
    const sellers = await getAllSellers();
    res.status(200).json({ success: true, data: sellers });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// ✅ Get a seller by ID
router.get("/:sellerId", async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const seller = await getSellerById(sellerId);
    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});



// ✅ Update a seller
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

// ✅ Delete a seller
router.delete("/:sellerId", async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const deletedSeller = await deleteSeller(sellerId);
    res.status(200).json({ success: true, data: deletedSeller });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = router;
