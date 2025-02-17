const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerAddresses,
  addCustomerAddress,
  getCustomerDetailsByToken,
} = require("../repos/customer.repo");
const { AppError } = require("../utils/errorHandler");
const { validateAddress } = require("../middlewares/addressValidation.midleware"); 


router.post("/", async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone1, password, addresses = [] } = req.body; 

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCustomer = await createCustomer({
      firstName,
      lastName,
      email,
      phone1,
      password: hashedPassword,
      salt,
      addresses, 
    });

    res.status(201).json({ success: true, data: newCustomer });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Get customer details using token
router.get("/me", async (req, res, next) => {
  try {
    const userId = req.user.sub; 
    console.log(userId);
    if (!userId) {
      throw new AppError("User ID is missing from token", 400);
    }

    const customer = await getCustomerDetailsByToken(userId);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});


// ✅ Get all customers
router.get("/", async (req, res, next) => {
  try {
    const customers = await getAllCustomers();
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

//  Get a customer by ID
router.get("/:customerId", async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const customer = await getCustomerById(customerId);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});


//  Get a customer's addresses
router.get("/:customerId/addresses", async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const addresses = await getCustomerAddresses(customerId);
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});



//  Update a customer
router.put("/:customerId", async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedCustomer = await updateCustomer(customerId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedCustomer });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});


//  Add a new address to a customer
router.post("/:customerId/addresses", validateAddress, async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const newAddress = req.body;

    const updatedAddresses = await addCustomerAddress(customerId, newAddress);

    res.status(200).json({ success: true, data: updatedAddresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});



//  Delete a customer
router.delete("/:customerId", async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const deletedCustomer = await deleteCustomer(customerId);
    res.status(200).json({ success: true, data: deletedCustomer });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = router;
