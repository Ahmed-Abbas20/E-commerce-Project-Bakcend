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
  deleteCustomerAddressByIndex,
  addCustomerAddress,
} = require("../repos/customer.repo");
const { AppError } = require("../utils/errorHandler");
const { validateAddress } = require("../middlewares/addressValidation.midleware"); 
const { softDeleteUser } = require("../services/auth.service");
const { verifyToken } = require("../utils/jwttoken.manager");
const checkPermission = require("../middlewares/authorization.middleware"); 

// Create a new customer
router.post("/",checkPermission("customer","create"),async (req, res, next) => {
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
router.get("/my/profile", async (req, res, next) => {
  try {
    const userId = req.user.sub; 
    console.log(userId);
    if (!userId) {
      throw new AppError("User ID is missing from token", 400);
    }

    const customer = await getCustomerById(userId);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});


// Get all customers
router.get("/", checkPermission("customer","getAll"),async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 20; 
    const { customers, pagination } = await getAllCustomers(page, limit);

    res.status(200).json({ success: true, data: customers ,pagination:pagination });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

//  Get a customer by ID
router.get("/:customerId",checkPermission("customer","getById"), async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const customer = await getCustomerById(customerId);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Fetch Addresses Using Token
router.get("/my/addresses", async (req, res, next) => {
  try {
    const customerId = req.user.sub; 
    const addresses = await getCustomerAddresses(customerId);
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

//  Get a customer's addresses
router.get("/:customerId/addresses",checkPermission("customer","getAddressByCustomerId"), async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const addresses = await getCustomerAddresses(customerId);
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});


// Update Customer Using Token
router.put("/my/profile", async (req, res, next) => {
  try {
    const customerId = req.user.sub; 
    const updatedData = req.body;
    const uploadedFile = req.files?.image ? [req.files.image] : [];

    const updatedCustomer = await updateCustomer(customerId, updatedData, uploadedFile);
    res.status(200).json({ success: true, data: updatedCustomer });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

//  Update a customer
router.put("/:customerId", checkPermission("customer","updateById"),async (req, res, next) => {
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


// Add Address Using Token
router.post("/my/addresses", validateAddress, async (req, res, next) => {
  try {
    const customerId = req.user.sub; 
    const newAddress = req.body;

    const updatedAddresses = await addCustomerAddress(customerId, newAddress);

    res.status(200).json({ success: true, data: updatedAddresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Delete Address Using Token by Index
router.delete("/my/addresses/:index", async (req, res, next) => {
  try {
    const customerId = req.user.sub; 
    const addressIndex = parseInt(req.params.index, 10);

    if (isNaN(addressIndex) || addressIndex < 0) {
      throw new AppError("Invalid address index", 400);
    }

    const updatedAddresses = await deleteCustomerAddressByIndex(customerId, addressIndex);

    res.status(200).json({ success: true, data: updatedAddresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

//  Add a new address to a customer
router.post("/:customerId/addresses",checkPermission("customer","addAddressByCustomerId"), validateAddress, async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const newAddress = req.body;

    const updatedAddresses = await addCustomerAddress(customerId, newAddress);

    res.status(200).json({ success: true, data: updatedAddresses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});



//  Delete a customer by id
 router.delete("/:customerId",checkPermission("customer","deleteById"), async (req, res, next) => {
   try {
    const { customerId } = req.params;
     const deletedCustomer = await deleteCustomer(customerId);
     res.status(200).json({ success: true, data: deletedCustomer });
   } catch (error) {
     return next(new AppError(error.message, 500));
   }
 });


router.delete("/", async (req, res, next) => {
  try {
    const  userId  = req.user.sub;

    // Call the softDeleteUser function
    const user = await softDeleteUser(userId);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
