const User = require("../models/base.model");
const { uploadUserImage } = require("../services/userImageUpload.service");
const { AppError } = require("../utils/errorHandler");

// ✅ Create a new customer


module.exports.createCustomer = async ({
  firstName,
  lastName,
  email,
  phone1,
  password,
  salt,
  addresses = [], 
  image, 
}) => {
  try {
    const customer = new User({
      firstName,
      lastName,
      email,
      phone1,
      password,
      salt,
      userType: "customer",
      addresses: Array.isArray(addresses) ? addresses : [], 
      image: image || undefined, 
    });

    await customer.save();
    return customer;
  } catch (error) {
    throw new AppError(`Error creating customer: ${error.message}`, 500);
  }
};


//  Get all customers
module.exports.getAllCustomers = async () => {
  try {
    const customers = await User.find({ userType: "customer",isActive:true });
    return customers;
  } catch (error) {
    throw new AppError(`Error fetching customers: ${error.message}`, 500);
  }
};

//  Get a customer by ID
module.exports.getCustomerById = async (customerId) => {
  try {
    const customer = await User.findOne({ _id: customerId, userType: "customer" });
    if (!customer) throw new AppError("Customer not found", 404);

    return customer;
  } catch (error) {
    throw new AppError(`Error fetching customer: ${error.message}`, 500);
  }
};

// Fetch customer details using userId (from token)
module.exports.getCustomerDetailsByToken = async (userId) => {
  try {
    const customer = await User.findOne(
      { _id: userId, userType: "customer" },
      { password: 0, salt: 0 } // Exclude sensitive fields
    );

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    return customer;
  } catch (error) {
    throw new AppError(`Error fetching customer details: ${error.message}`, 500);
  }
};


//  Update a customer
module.exports.updateCustomer = async (customerId, updatedData, uploadedFile = []) => {
  try {
    const existingCustomer = await User.findOne({ _id: customerId, userType: "customer" });

    if (!existingCustomer) {
      throw new AppError("Customer not found", 404);
    }

    const imageUpdate = await uploadUserImage(existingCustomer.image?.fileId, uploadedFile);
    if (imageUpdate) {
      updatedData.image = imageUpdate;
    }

    Object.assign(existingCustomer, updatedData);
    await existingCustomer.save();

    return existingCustomer;
  } catch (error) {
    throw new AppError(`Error updating customer: ${error.message}`, 500);
  }
};

//  Get a customer's addresses
module.exports.getCustomerAddresses = async (customerId) => {
  try {
    const customer = await User.findOne(
      { _id: customerId, userType: "customer" },
      { addresses: 1, _id: 0 } 
    );

    if (!customer) throw new AppError("Customer not found", 404);

    return customer.addresses;
  } catch (error) {
    throw new AppError(`Error fetching customer addresses: ${error.message}`, 500);
  }
};



//  Add a new address to a customer
module.exports.addCustomerAddress = async (customerId, newAddress) => {
  try {
    const customer = await User.findOne({ _id: customerId, userType: "customer" });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

   
    customer.addresses.push(newAddress);

    await customer.save();

    return customer.addresses; // Return updated addresses
  } catch (error) {
    throw new AppError(`Error adding address: ${error.message}`, 500);
  }
};


//  Delete a customer
module.exports.deleteCustomer = async (customerId) => {
  try {
    const deletedCustomer = await User.findOneAndDelete({ _id: customerId, userType: "customer" });
    if (!deletedCustomer) throw new AppError("Customer not found", 404);

    return deletedCustomer;
  } catch (error) {
    throw new AppError(`Error deleting customer: ${error.message}`, 500);
  }
};
